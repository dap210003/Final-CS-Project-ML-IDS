# LCCDE Project

A modularized pipeline extracted from Jupyter notebook.

## Setup
```
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
pip install -e .
```

## Train
```
python scripts/train.py --config configs/base.yaml
```

## Evaluate
```
python scripts/evaluate.py --config configs/base.yaml --model artifacts/model.joblib
```
