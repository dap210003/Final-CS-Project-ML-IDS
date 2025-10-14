from __future__ import annotations
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer


def split_X_y(df: pd.DataFrame, target: str) -> tuple[pd.DataFrame, pd.Series]:
    """Splits DataFrame into features (X) and target (y)."""
    y = df[target]
    X = df.drop(columns=[target])
    return X, y


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """Builds preprocessing pipeline for numeric and categorical data."""
    numeric_cols = X.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = X.select_dtypes(exclude=["number"]).columns.tolist()

    numeric = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric, numeric_cols),
            ("cat", categorical, categorical_cols),
        ]
    )
    return preprocessor
