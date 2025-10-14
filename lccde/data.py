# Data loading and cleaning placeholder
from __future__ import annotations
from pathlib import Path
import pandas as pd
from .utils.io import read_csv


# 🔹 Load all raw CSV files from the data directory
def load_raw_csvs(data_dir: str | Path) -> list[pd.DataFrame]:
    """
    Loads all CSV files from a given folder into a list of DataFrames.
    Example: data/raw/
    """
    data_dir = Path(data_dir)
    csvs = sorted(data_dir.glob("*.csv"))
    if not csvs:
        raise FileNotFoundError(f"No CSV files found in {data_dir}")
    return [read_csv(f) for f in csvs]


# 🔹 Combine all CSVs into one DataFrame
def concatenate_raw(frames: list[pd.DataFrame]) -> pd.DataFrame:
    """
    Combines multiple DataFrames into a single one.
    """
    return pd.concat(frames, axis=0, ignore_index=True)


# 🔹 Clean the dataset — replace with your notebook’s cleaning logic
import pandas as pd
import numpy as np

def basic_clean(df: pd.DataFrame) -> pd.DataFrame:
    # Drop fully empty rows
    df = df.dropna(axis=0, how="all")

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Remove duplicate columns
    df = df.loc[:, ~df.columns.duplicated()]

    # Strip whitespace from string cells
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    # Convert numeric-like columns to real numbers, coerce errors to NaN
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="ignore")

    # Now replace string infinities with np.inf, then handle them
    df = df.replace(["Infinity", "inf", "INF", "NaN", "nan"], np.nan)

    # Replace inf/-inf with NaN
    df = df.replace([np.inf, -np.inf], np.nan)

    # Fill remaining NaNs with 0
    df = df.fillna(0)

    # Only clip numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].clip(lower=-1e12, upper=1e12)

    return df





# 🔹 Example main function to test loading and cleaning
if __name__ == "__main__":
    raw_path = Path("data/raw")
    frames = load_raw_csvs(raw_path)
    df = concatenate_raw(frames)
    df = basic_clean(df)
    print(df.head())
    print(f"✅ Loaded and cleaned {len(df)} rows, {len(df.columns)} columns.")
