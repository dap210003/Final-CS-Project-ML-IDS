from pathlib import Path
from lccde.config import Config


def test_config_load(tmp_path: Path):
    """Quick sanity check that Config.load works correctly."""
    cfg_text = (
        "project_root: .\n"
        "paths:\n"
        "  data_raw: data/raw\n"
        "  data_interim: data/interim\n"
        "  data_processed: data/processed\n"
        "  artifacts: artifacts\n"
        "train:\n"
        "  target: label\n"
    )

    config_file = tmp_path / "test_config.yaml"
    config_file.write_text(cfg_text)

    cfg = Config.load(config_file)

    assert cfg.paths.project_root.exists()
    assert cfg.train.target == "label"
