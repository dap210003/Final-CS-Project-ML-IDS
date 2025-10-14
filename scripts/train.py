from __future__ import annotations
import argparse
from pathlib import Path
from lccde.train import run_train


def main():
    parser = argparse.ArgumentParser(description="Train the LCCDE model.")
    parser.add_argument(
        "--config",
        type=Path,
        required=True,
        help="Path to the YAML config file (e.g., configs/base.yaml)",
    )
    args = parser.parse_args()
    run_train(args.config)


if __name__ == "__main__":
    main()
