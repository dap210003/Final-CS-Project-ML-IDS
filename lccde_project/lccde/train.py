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
        skipped_cols = [c for c in cfg.train.drop_cols if c not in df.columns]
        if skipped_cols:
            logger.warning(f"drop_cols requested but not found in data: {skipped_cols}")
        if drop_cols:
            logger.info(f"Dropping columns: {drop_cols}")
            df = df.drop(columns=drop_cols)
        logger.info(f"Remaining columns ({len(df.columns)}): {df.columns.tolist()}")

    X, y = split_X_y(df, cfg.train.target)
    
    # Diagnostic: Log class distribution
    class_counts = y.value_counts()
    logger.info(f"Class distribution before split: {class_counts.to_dict()}")
    logger.info(f"Total samples: {len(y)}, Unique classes: {len(class_counts)}")
    
    # Fail-fast if single class detected
    if len(class_counts) <= 1:
        raise ValueError(
            f"CRITICAL: Only {len(class_counts)} class(es) found after cleaning! "
            f"Classes: {class_counts.index.tolist()}. Check basic_clean and drop_cols."
        )
    
    # Warn if severe class imbalance (>95% one class)
    max_ratio = class_counts.max() / len(y)
    if max_ratio > 0.95:
        logger.warning(f"SEVERE CLASS IMBALANCE: {max_ratio:.1%} of samples are class '{class_counts.idxmax()}'")
    
    Xtr, Xte, ytr, yte = train_test_split(
        X, y,
        test_size=cfg.train.test_size,
        random_state=cfg.train.random_state,
        stratify=y,
    )
    
    # Diagnostic: Log hyperparameters being used
    logger.info(f"Training with: n_estimators={cfg.train.rf_n_estimators}, "
                f"max_depth={cfg.train.rf_max_depth}, random_state={cfg.train.random_state}")
    logger.info(f"Train size: {len(Xtr)}, Test size: {len(Xte)}")
    
    model = make_model(Xtr, cfg.train)
    model.fit(Xtr, ytr)

    preds = model.predict(Xte)
    report = classification_report(yte, preds)
    # Print report to stdout for backend parsing (ASCII safe for Windows)
    print("\n=== CLASSIFICATION REPORT ===")
    print(report.encode('ascii', 'replace').decode('ascii'))
    print("=== END REPORT ===")

    out = cfg.paths.artifacts / "model.joblib"
    joblib.dump({"model": model, "report": report}, out)
    logger.info(f"Saved model to {out}")
    return out
