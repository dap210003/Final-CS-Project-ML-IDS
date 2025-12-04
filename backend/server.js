const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg');

const PORT = process.env.PORT || 4000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'user',
  database: process.env.DB_NAME || 'lccde_db',
  port: process.env.DB_PORT || 5432,
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || '',
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ====================
// DATASETS API
// ====================
app.get('/api/datasets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM datasets ORDER BY upload_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/datasets', async (req, res) => {
  const { filename, source, feature_count, label_count } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO datasets (filename, source, feature_count, label_count) VALUES ($1, $2, $3, $4) RETURNING *',
      [filename, source, feature_count, label_count]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/datasets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM datasets WHERE dataset_id = $1', [req.params.id]);
    res.json({ message: 'Dataset deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================
// MODELS API
// ====================
app.get('/api/models', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM models');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models/:id/parameters', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM model_parameters WHERE model_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/models/:id/parameters', async (req, res) => {
  const { parameters } = req.body; // Array of { param_name, param_value }
  try {
    for (const param of parameters) {
      await pool.query(
        'UPDATE model_parameters SET param_value = $1 WHERE model_id = $2 AND param_name = $3',
        [param.param_value, req.params.id, param.param_name]
      );
    }
    res.json({ message: 'Parameters updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================
// EXPERIMENTS API
// ====================
app.get('/api/experiments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, m.model_name, d.filename as dataset_name,
             er.accuracy, er.precision, er.recall, er.f1_score, er.runtime
      FROM experiments e
      LEFT JOIN models m ON e.model_id = m.model_id
      LEFT JOIN datasets d ON e.dataset_id = d.dataset_id
      LEFT JOIN experiment_results er ON e.experiment_id = er.experiment_id
      ORDER BY e.start_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await pool.query(`
      SELECT e.*, m.model_name, d.filename as dataset_name
      FROM experiments e
      LEFT JOIN models m ON e.model_id = m.model_id
      LEFT JOIN datasets d ON e.dataset_id = d.dataset_id
      WHERE e.experiment_id = $1
    `, [req.params.id]);
    
    const parameters = await pool.query(
      'SELECT * FROM experiment_parameters WHERE experiment_id = $1',
      [req.params.id]
    );
    
    const results = await pool.query(
      'SELECT * FROM experiment_results WHERE experiment_id = $1',
      [req.params.id]
    );
    
    res.json({
      ...experiment.rows[0],
      parameters: parameters.rows,
      results: results.rows[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/experiments', async (req, res) => {
  const { model_id, dataset_id, parameters, notes } = req.body;
  try {
    // Create experiment
    const expResult = await pool.query(
      'INSERT INTO experiments (model_id, dataset_id, notes, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [model_id, dataset_id, notes, 'running']
    );
    const experiment = expResult.rows[0];
    
    // Store experiment parameters
    if (parameters && parameters.length > 0) {
      for (const param of parameters) {
        await pool.query(
          'INSERT INTO experiment_parameters (experiment_id, param_name, param_value) VALUES ($1, $2, $3)',
          [experiment.experiment_id, param.param_name, param.param_value]
        );
      }
    }
    
    res.status(201).json(experiment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/experiments/:id/results', async (req, res) => {
  const { accuracy, precision, recall, f1_score, runtime } = req.body;
  try {
    // Update experiment status
    await pool.query(
      'UPDATE experiments SET status = $1, end_time = NOW() WHERE experiment_id = $2',
      ['completed', req.params.id]
    );
    
    // Insert results
    const result = await pool.query(
      'INSERT INTO experiment_results (experiment_id, accuracy, precision, recall, f1_score, runtime) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.params.id, accuracy, precision, recall, f1_score, runtime]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/experiments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM experiments WHERE experiment_id = $1', [req.params.id]);
    res.json({ message: 'Experiment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================
// ML MODEL ENDPOINT (calls Python)
// ====================
const { spawn } = require('child_process');

// Helper to run Python scripts
function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const python = process.env.PYTHON_PATH || 'python';
    const lccdeProjectPath = path.join(__dirname, '..', 'lccde_project');
    const proc = spawn(python, [scriptPath, ...args], {
      cwd: lccdeProjectPath,
      env: { 
        ...process.env, 
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: lccdeProjectPath + (process.env.PYTHONPATH ? path.delimiter + process.env.PYTHONPATH : '')
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('[Python]', data.toString());
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('[Python Error]', data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout, code });
      } else {
        reject({ success: false, error: stderr || stdout, code });
      }
    });

    proc.on('error', (err) => {
      reject({ success: false, error: err.message, code: -1 });
    });
  });
}

const fs = require('fs');
const yaml = require('js-yaml');

app.post('/api/ml/train', async (req, res) => {
  const { experiment_id, parameters } = req.body;
  // parameters: { random_seed, test_size, rf_n_estimators, rf_max_depth, etc. }

  try {
    // Update experiment status to running
    if (experiment_id) {
      await pool.query(
        'UPDATE experiments SET status = $1, start_time = NOW() WHERE experiment_id = $2',
        ['running', experiment_id]
      );
    }

    // Create dynamic config file with user parameters
    const baseConfigPath = path.join(__dirname, '..', 'lccde_project', 'configs', 'base.yaml');
    const baseConfig = yaml.load(fs.readFileSync(baseConfigPath, 'utf8'));
    
    // Override with user parameters
    if (parameters) {
      if (parameters.random_seed) baseConfig.train.random_state = parseInt(parameters.random_seed);
      if (parameters.test_size) baseConfig.train.test_size = parseFloat(parameters.test_size);
      if (parameters.rf_n_estimators) baseConfig.train.rf_n_estimators = parseInt(parameters.rf_n_estimators);
      if (parameters.rf_max_depth) baseConfig.train.rf_max_depth = parameters.rf_max_depth === 'null' ? null : parseInt(parameters.rf_max_depth);
    }

    // Write dynamic config
    const dynamicConfigPath = path.join(__dirname, '..', 'lccde_project', 'configs', `experiment_${experiment_id || Date.now()}.yaml`);
    fs.writeFileSync(dynamicConfigPath, yaml.dump(baseConfig), 'utf8');
    console.log('[Train] Using config:', dynamicConfigPath);

    const startTime = Date.now();
    const result = await runPythonScript('scripts/train.py', ['--config', dynamicConfigPath]);
    const runtime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Parse metrics from classification report in output
    let metrics = { accuracy: 0, precision: 0, recall: 0, f1_score: 0 };
    try {
      const fullOutput = result.output;
      console.log('[Train] Parsing metrics from output...');
      
      const lines = fullOutput.split('\n');
      for (const line of lines) {
        // Look for macro avg line which provides unweighted average across all classes
        if (line.includes('macro avg')) {
          const parts = line.trim().split(/\s+/);
          console.log('[Train] Found macro avg:', parts);
          // Format: "macro avg  precision  recall  f1-score  support"
          if (parts.length >= 5) {
            metrics.precision = parseFloat(parts[2]) || 0;
            metrics.recall = parseFloat(parts[3]) || 0;
            metrics.f1_score = parseFloat(parts[4]) || 0;
          }
        }
        // Look for accuracy line (format: "accuracy  0.99  12345")
        if (line.trim().startsWith('accuracy')) {
          const parts = line.trim().split(/\s+/);
          console.log('[Train] Found accuracy:', parts);
          if (parts.length >= 2) {
            metrics.accuracy = parseFloat(parts[1]) || 0;
          }
        }
      }
      
      console.log('[Train] Parsed metrics:', metrics);
    } catch (parseErr) {
      console.log('Could not parse metrics:', parseErr);
    }

    // Update experiment status to completed and save results
    if (experiment_id) {
      await pool.query(
        'UPDATE experiments SET status = $1, end_time = NOW() WHERE experiment_id = $2',
        ['completed', experiment_id]
      );
      
      // Save results - first check if exists
      const existingResult = await pool.query(
        'SELECT result_id FROM experiment_results WHERE experiment_id = $1',
        [experiment_id]
      );
      
      if (existingResult.rows.length > 0) {
        await pool.query(
          `UPDATE experiment_results SET accuracy = $1, "precision" = $2, recall = $3, f1_score = $4, runtime = $5 WHERE experiment_id = $6`,
          [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score, `${runtime} seconds`, experiment_id]
        );
      } else {
        await pool.query(
          `INSERT INTO experiment_results (experiment_id, accuracy, "precision", recall, f1_score, runtime) VALUES ($1, $2, $3, $4, $5, $6)`,
          [experiment_id, metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score, `${runtime} seconds`]
        );
      }
      console.log('[Train] Saved results to database for experiment:', experiment_id);
    }

    // Cleanup dynamic config
    try { fs.unlinkSync(dynamicConfigPath); } catch (e) {}

    res.json({ 
      message: 'Training completed',
      output: result.output,
      model_path: 'artifacts/model.joblib',
      metrics,
      runtime: `${runtime}s`
    });
  } catch (err) {
    // Update experiment status to failed
    if (experiment_id) {
      await pool.query(
        'UPDATE experiments SET status = $1, end_time = NOW() WHERE experiment_id = $2',
        ['failed', experiment_id]
      );
    }

    res.status(500).json({ 
      message: 'Training failed',
      error: err.error || err.message
    });
  }
});

app.post('/api/ml/evaluate', async (req, res) => {
  const { config_path, model_path, experiment_id } = req.body;
  const configFile = config_path || 'configs/base.yaml';
  const modelFile = model_path || 'artifacts/model.joblib';

  try {
    const result = await runPythonScript('scripts/evaluate.py', [
      '--config', configFile,
      '--model', modelFile
    ]);

    // Parse metrics from output if possible
    let metrics = {};
    try {
      // Try to extract metrics from the output
      const lines = result.output.split('\n');
      for (const line of lines) {
        if (line.includes('accuracy')) {
          const match = line.match(/accuracy[:\s]+([0-9.]+)/i);
          if (match) metrics.accuracy = parseFloat(match[1]);
        }
        if (line.includes('precision')) {
          const match = line.match(/precision[:\s]+([0-9.]+)/i);
          if (match) metrics.precision = parseFloat(match[1]);
        }
        if (line.includes('recall')) {
          const match = line.match(/recall[:\s]+([0-9.]+)/i);
          if (match) metrics.recall = parseFloat(match[1]);
        }
        if (line.includes('f1')) {
          const match = line.match(/f1[:\s-]+([0-9.]+)/i);
          if (match) metrics.f1_score = parseFloat(match[1]);
        }
      }
    } catch (parseErr) {
      console.log('Could not parse metrics:', parseErr);
    }

    // Save results to database if experiment_id provided
    if (experiment_id && Object.keys(metrics).length > 0) {
      await pool.query(
        `INSERT INTO experiment_results (experiment_id, accuracy, precision_score, recall, f1_score)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (experiment_id) DO UPDATE SET
         accuracy = $2, precision_score = $3, recall = $4, f1_score = $5`,
        [experiment_id, metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score]
      );
    }

    res.json({ 
      message: 'Evaluation completed',
      output: result.output,
      metrics
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Evaluation failed',
      error: err.error || err.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
