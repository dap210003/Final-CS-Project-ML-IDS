-- Datasets Table
CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    source VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feature_count INT CHECK (feature_count >= 0),
    label_count INT CHECK (label_count >= 0)
);

-- Models Table
CREATE TABLE models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Model Parameters Table
-- Stores current “default” or editable parameters for each model
CREATE TABLE model_parameters (
    param_id SERIAL PRIMARY KEY,
    model_id INT REFERENCES models(model_id) ON DELETE CASCADE,
    param_name VARCHAR(100) NOT NULL,
    param_value VARCHAR(255),
    param_type VARCHAR(50),  -- e.g., 'int', 'float', 'bool', 'string'
    editable BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- Experiments Table
CREATE TABLE experiments (
    experiment_id SERIAL PRIMARY KEY,
    model_id INT REFERENCES models(model_id) ON DELETE CASCADE,
    dataset_id INT REFERENCES datasets(dataset_id) ON DELETE CASCADE,
    user_id INT,  -- optional for multi-user system
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'running',  -- running, completed, failed
    notes TEXT
);

-- Experiment Parameters Table
-- Stores snapshot of model parameters used in a given experiment
CREATE TABLE experiment_parameters (
    experiment_id INT REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    param_name VARCHAR(100),
    param_value VARCHAR(255),
    PRIMARY KEY (experiment_id, param_name)
);

-- Experiment Results Table
CREATE TABLE experiment_results (
    result_id SERIAL PRIMARY KEY,
    experiment_id INT REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    accuracy NUMERIC(5,4) CHECK (accuracy BETWEEN 0 AND 1),
    precision NUMERIC(5,4) CHECK (precision BETWEEN 0 AND 1),
    recall NUMERIC(5,4) CHECK (recall BETWEEN 0 AND 1),
    f1_score NUMERIC(5,4) CHECK (f1_score BETWEEN 0 AND 1),
    runtime INTERVAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes for Performance
-- ===========================================

CREATE INDEX idx_experiments_model_id ON experiments (model_id);
CREATE INDEX idx_experiments_dataset_id ON experiments (dataset_id);
CREATE INDEX idx_results_experiment_id ON experiment_results (experiment_id);
CREATE INDEX idx_experiments_start_time ON experiments (start_time);
CREATE INDEX idx_experiments_status ON experiments (status);

-- ===========================================
-- Optional: Sample Data
-- ===========================================
-- INSERT INTO models (model_name, description)
-- VALUES ('LCCDE', 'Lightweight Collaborative Cluster Detection Engine');

-- INSERT INTO model_parameters (model_id, param_name, param_value, param_type, description)
-- VALUES (1, 'learning_rate', '0.01', 'float', 'Controls model convergence speed'),
--        (1, 'max_iterations', '100', 'int', 'Maximum iterations for convergence'),
--        (1, 'normalize_input', 'True', 'bool', 'Normalize input features before training');

-- ===========================================
-- End of Schema
-- ===========================================
