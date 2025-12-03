from __future__ import annotations
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from .features import build_preprocessor


def make_model(X, cfg) -> Pipeline:
    """Builds a model pipeline with preprocessing and classifier."""
    pre = build_preprocessor(X)

    if cfg.model_type == "RandomForest":
        clf = RandomForestClassifier(
            n_estimators=cfg.rf_n_estimators,
            max_depth=cfg.rf_max_depth,
            random_state=cfg.random_state,
            n_jobs=-1,
        )
    else:
        raise ValueError(f"Unsupported model_type: {cfg.model_type}")

    pipe = Pipeline(steps=[
        ("pre", pre),
        ("clf", clf),
    ])
    return pipe
