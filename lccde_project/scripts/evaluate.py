from __future__ import annotations
import argparse
from pathlib import Path
from lccde.evaluate import run_evaluate


def main():
    parser = argparse.ArgumentParser(description="Evaluate a trained LCCDE model.")
    parser.add_argument(
        "--config",
        type=Path,
        required=True,
        help="Path to the YAML config file (e.g., configs/base.yaml)",
    )
    parser.add_argument(
        "--model",
        type=Path,
        required=True,
        help="Path to the trained model file (e.g., artifacts/model.joblib)",
    )

    args = parser.parse_args()
    results = run_evaluate(args.config, args.model)
    print("📊 Evaluation Results:")
    print(results)


if __name__ == "__main__":
    main()
