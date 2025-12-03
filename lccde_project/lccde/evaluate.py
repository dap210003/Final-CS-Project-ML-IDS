from __future__ import annotations
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

from .config import Config
from .utils.io import read_csv
from .utils.logging import get_logger
from .features import split_X_y


def run_evaluate(config_path: str | Path, model_path: str | Path) -> dict:
    logger = get_logger()
    cfg = Config.load(config_path)
    bundle = joblib.load(model_path)
    model = bundle["model"]

    processed = cfg.paths.data_processed / "dataset.csv"
    if not processed.exists():
        raise FileNotFoundError(f"Expected processed dataset at {processed}")
    df = read_csv(processed)

    X, y = split_X_y(df, cfg.train.target)
    preds = model.predict(X)

    report = classification_report(y, preds, output_dict=True)
    cm = confusion_matrix(y, preds)
    logger.info("Evaluation complete")

    return {"report": report, "confusion_matrix": cm.tolist()}
