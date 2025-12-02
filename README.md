# ML-IDS Platform

A web-based Machine Learning Intrusion Detection System (ML-IDS) for training, evaluating, and comparing machine learning models on network security datasets.

## Overview

CyberCanvas AI provides an interface to:

- Run ML experiments with configurable parameters
- Visualize training metrics
- Compare multiple experiments
- Manage datasets
- Store experiment results in a PostgreSQL database

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Machine Learning:** Python (scikit-learn, pandas, joblib)

## Prerequisites

Install the following before running the project:

- **Node.js** (v18+)
- **Python** (v3.11+)
- **PostgreSQL** (v14+)
- **Conda** (recommended) or pip

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ml-ids
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at:  
**http://localhost:8000**

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/mlids_db
```

### 4. Database Setup

```bash
psql -U postgres
CREATE DATABASE mlids_db;
\q
psql -U postgres -d mlids_db -f backend/dsSchema.sql
```

(Optional) Seed data:

```bash
psql -U postgres -d mlids_db -f backend/seed.sql
```

### 5. Python Environment Setup

```bash
cd lccde_project
```

#### Conda

```bash
conda env create -f environment.yml
conda activate lccde
```

#### Pip

```bash
pip install -r requirements.txt
pip install -e .
```

### 6. Dataset Setup

Place datasets in:

```
lccde_project/data/raw/
```

A sample dataset exists at:

```
public/datasets/cicids2017_sample.csv
```

## Running the Application

### Terminal 1 — Frontend

```bash
npm run dev
```

### Terminal 2 — Backend

```bash
cd backend
node server.js
```

Backend API runs at:  
**http://localhost:3001**

## Usage

### Run an Experiment

1. Select a dataset  
2. Configure hyperparameters  
3. Start training  

### View Results

- Accuracy, Precision, Recall, F1 Score  
- Graphs such as ROC curves  

### Compare Experiments

View multiple experiments side-by-side.

### Manage Datasets

Upload or delete datasets through the UI.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/experiments` | GET | List experiments |
| `/api/experiments` | POST | Create experiment |
| `/api/experiments/:id` | GET | Get experiment info |
| `/api/ml/train` | POST | Run ML training |
| `/api/datasets` | GET | List datasets |
| `/api/datasets` | POST | Upload dataset |

## Project Structure

```
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
├── backend/
│   ├── server.js
│   └── dsSchema.sql
├── lccde_project/
│   ├── lccde/
│   ├── scripts/
│   ├── configs/
│   └── data/
└── public/
```

## Troubleshooting

### “No CSVs found”
Ensure CSVs are in `lccde_project/data/raw/`.

### Database issues
- Verify PostgreSQL is running  
- Check credentials in `.env`  

### Metrics all zero
Ensure Python environment is activated.


