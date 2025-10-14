from __future__ import annotations
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from .config import Config
from .utils.io import ensure_dir, read_csv
from .utils.logging import get_logger
from .data import basic_clean
from .features import split_X_y
from .model import make_model


def run_train(config_path: str | Path) -> Path:
    logger = get_logger()
    cfg = Config.load(config_path)
    ensure_dir(cfg.paths.artifacts)

    # Load processed or build from raw
    processed = cfg.paths.data_processed / "dataset.csv"
    if processed.exists():
        df = read_csv(processed)
        logger.info(f"Loaded processed dataset: {processed}")
    else:
        raw_files = list(cfg.paths.data_raw.glob("*.csv"))
        if not raw_files:
            raise FileNotFoundError(f"No CSVs in {cfg.paths.data_raw}")
        frames = [read_csv(f) for f in raw_files]
        df = pd.concat(frames, ignore_index=True)
        df = basic_clean(df)
        ensure_dir(cfg.paths.data_processed)
        df.to_csv(processed, index=False)
        logger.info(f"Wrote processed dataset: {processed}")

    if cfg.train.drop_cols:
        drop_cols = [c for c in cfg.train.drop_cols if c in df.columns]
        df = df.drop(columns=drop_cols)

    X, y = split_X_y(df, cfg.train.target)
    Xtr, Xte, ytr, yte = train_test_split(
        X, y,
        test_size=cfg.train.test_size,
        random_state=cfg.train.random_state,
        stratify=y if len(y.unique()) > 1 else None,
    )

    model = make_model(Xtr, cfg.train)
    model.fit(Xtr, ytr)

    preds = model.predict(Xte)
    report = classification_report(yte, preds)
    logger.info("\n" + report)

    out = cfg.paths.artifacts / "model.joblib"
    joblib.dump({"model": model, "report": report}, out)
    logger.info(f"Saved model to {out}")
    return out
