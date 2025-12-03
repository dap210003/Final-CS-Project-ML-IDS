# LCCDE Backend API

Express.js backend for the LCCDE ML experiment platform.

## Setup

```bash
cd backend
npm install
```

## Database Setup

1. Create a PostgreSQL database
2. Run the schema:
```bash
psql -U your_user -d lccde_db -f dsSchema.sql
```

## Environment Variables

Create a `.env` file or set these variables:
```
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=lccde_db
DB_HOST=localhost
DB_PORT=5432
PORT=4000
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Datasets
- `GET /api/datasets` - List all datasets
- `POST /api/datasets` - Upload dataset metadata
- `DELETE /api/datasets/:id` - Delete dataset

### Models
- `GET /api/models` - List all models
- `GET /api/models/:id/parameters` - Get model parameters
- `PUT /api/models/:id/parameters` - Update model parameters

### Experiments
- `GET /api/experiments` - List all experiments
- `GET /api/experiments/:id` - Get experiment details
- `POST /api/experiments` - Create new experiment
- `PUT /api/experiments/:id/results` - Save experiment results
- `DELETE /api/experiments/:id` - Delete experiment

### ML Operations
- `POST /api/ml/train` - Trigger model training
- `POST /api/ml/evaluate` - Trigger model evaluation

### Health
- `GET /api/health` - Health check

## Connecting to Python ML Pipeline

The `/api/ml/train` and `/api/ml/evaluate` endpoints are placeholders. To connect them to the Python LCCDE pipeline:

1. Use `child_process` to spawn Python scripts
2. Or create a Flask/FastAPI wrapper around the LCCDE module
3. Or use a job queue (Bull, etc.) for async training jobs
