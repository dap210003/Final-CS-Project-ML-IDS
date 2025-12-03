# Local Setup Guide

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **Python** (3.9+)

## 1. Database Setup

### Install PostgreSQL
- **macOS**: `brew install postgresql@14`
- **Ubuntu**: `sudo apt install postgresql`
- **Windows**: Download from https://www.postgresql.org/download/

### Create Database
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux

# Create database
createdb lccde_db

# Run schema
psql -d lccde_db -f backend/dsSchema.sql
```

### Configure Connection (optional)
Set environment variables or edit `backend/server.js`:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lccde_db
export DB_USER=postgres
export DB_PASSWORD=your_password
```

## 2. Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs at http://localhost:3001

## 3. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## 4. Python ML Environment

```bash
cd lccde_project

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Test Python Setup
```bash
python scripts/train.py --config configs/base.yaml
```

## 5. Dataset Setup

Place your dataset CSV files in:
```
lccde_project/data/raw/
```

The sample CIC-IDS2017 file is at `public/datasets/cicids2017_sample.csv`.

For full datasets:
- **CIC-IDS2017**: https://www.unb.ca/cic/datasets/ids-2017.html
- **CAN Intrusion**: https://ocslab.hksecurity.net/Datasets/CAN-intrusion-dataset

## Running an Experiment

1. Start PostgreSQL, backend, and frontend
2. Go to "Run Experiment" page
3. Select model and dataset
4. Click "Start Experiment"
5. The backend will call Python scripts and store results

## Troubleshooting

### Python not found
Set the `PYTHON_PATH` environment variable:
```bash
export PYTHON_PATH=/path/to/python
```

### Database connection failed
Check PostgreSQL is running and credentials are correct.

### Module not found
Ensure you're in the virtual environment and ran `pip install -r requirements.txt`.
