from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import yaml


@dataclass(frozen=True)
class Paths:
    project_root: Path
    data_raw: Path
    data_interim: Path
    data_processed: Path
    artifacts: Path


@dataclass(frozen=True)
class TrainConfig:
    test_size: float = 0.2
    random_state: int = 42
    target: str = "label"
    drop_cols: list[str] | None = None
    model_type: str = "RandomForest"
    rf_n_estimators: int = 300
    rf_max_depth: int | None = None


@dataclass(frozen=True)
class Config:
    paths: Paths
    train: TrainConfig

    @staticmethod
    def load(config_path: str | Path) -> "Config":
        p = Path(config_path)
        with p.open("r", encoding="utf-8") as f:
            raw = yaml.safe_load(f)

        root = Path(raw.get("project_root", ".")).resolve()
        paths = Paths(
            project_root=root,
            data_raw=(root / raw["paths"]["data_raw"]).resolve(),
            data_interim=(root / raw["paths"]["data_interim"]).resolve(),
            data_processed=(root / raw["paths"]["data_processed"]).resolve(),
            artifacts=(root / raw["paths"]["artifacts"]).resolve(),
        )

        t = raw.get("train", {})
        train = TrainConfig(
            test_size=float(t.get("test_size", 0.2)),
            random_state=int(t.get("random_state", 42)),
            target=t.get("target", "label"),
            drop_cols=t.get("drop_cols"),
            model_type=t.get("model_type", "RandomForest"),
            rf_n_estimators=int(t.get("rf_n_estimators", 300)),
            rf_max_depth=t.get("rf_max_depth"),
        )
        return Config(paths=paths, train=train)
