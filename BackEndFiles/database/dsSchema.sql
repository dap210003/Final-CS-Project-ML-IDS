-- ============================================
-- Datasets Table
-- Stores information about uploaded IDS datasets
-- ============================================
CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    source VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feature_count INT CHECK (feature_count >= 0),
    sample_count INT CHECK (sample_count >= 0),
    description TEXT
);

-- ============================================
-- Attack Types / Classes Table
-- Stores different types of attacks or classes in each dataset
-- ============================================
CREATE TABLE attack_types (
    type_id SERIAL PRIMARY KEY,
    dataset_id INT REFERENCES datasets(dataset_id) ON DELETE CASCADE,
    type_name VARCHAR(100) NOT NULL,
    type_code INT NOT NULL,
    sample_count INT,
    UNIQUE(dataset_id, type_code)
);

-- ============================================
-- Models Table
-- Stores information about available ML models
-- ============================================
CREATE TABLE models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50),
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Model Parameters Table
-- Stores default and editable parameters for each model
-- ============================================
CREATE TABLE model_parameters (
    param_id SERIAL PRIMARY KEY,
    model_id INT REFERENCES models(model_id) ON DELETE CASCADE,
    param_name VARCHAR(100) NOT NULL,
    default_value VARCHAR(255),
    param_type VARCHAR(50),
    min_value NUMERIC,
    max_value NUMERIC,
    editable BOOLEAN DEFAULT TRUE,
    category VARCHAR(50),
    description TEXT,
    UNIQUE(model_id, param_name)
);

-- ============================================
-- Experiments Table
-- Stores information about each experiment run
-- ============================================
CREATE TABLE experiments (
    experiment_id SERIAL PRIMARY KEY,
    experiment_name VARCHAR(200),
    model_id INT REFERENCES models(model_id) ON DELETE CASCADE,
    dataset_id INT REFERENCES datasets(dataset_id) ON DELETE CASCADE,
    user_id INT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'running',
    error_message TEXT,
    notes TEXT
);

-- ============================================
-- Experiment Parameters Table
-- Stores snapshot of parameters used in each experiment
-- ============================================
CREATE TABLE experiment_parameters (
    experiment_id INT REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    param_name VARCHAR(100),
    param_value TEXT,
    PRIMARY KEY (experiment_id, param_name)
);

-- ============================================
-- Experiment Results Table
-- Stores overall performance metrics for each experiment
-- ============================================
CREATE TABLE experiment_results (
    result_id SERIAL PRIMARY KEY,
    experiment_id INT REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    overall_accuracy NUMERIC(7,6) CHECK (overall_accuracy BETWEEN 0 AND 1),
    overall_precision NUMERIC(7,6) CHECK (overall_precision BETWEEN 0 AND 1),
    overall_recall NUMERIC(7,6) CHECK (overall_recall BETWEEN 0 AND 1),
    overall_f1_score NUMERIC(7,6) CHECK (overall_f1_score BETWEEN 0 AND 1),
    training_time INTERVAL,
    prediction_time INTERVAL,
    model_file_path VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Class-wise Results Table
-- Stores performance metrics for each attack type/class
-- ============================================
CREATE TABLE class_results (
    class_result_id SERIAL PRIMARY KEY,
    result_id INT REFERENCES experiment_results(result_id) ON DELETE CASCADE,
    type_id INT REFERENCES attack_types(type_id) ON DELETE CASCADE,
    precision NUMERIC(7,6) CHECK (precision BETWEEN 0 AND 1),
    recall NUMERIC(7,6) CHECK (recall BETWEEN 0 AND 1),
    f1_score NUMERIC(7,6) CHECK (f1_score BETWEEN 0 AND 1),
    support INT,
    UNIQUE(result_id, type_id)
);

-- ============================================
-- Confusion Matrix Table
-- Stores confusion matrix data for visualization
-- ============================================
CREATE TABLE confusion_matrix (
    matrix_id SERIAL PRIMARY KEY,
    result_id INT REFERENCES experiment_results(result_id) ON DELETE CASCADE,
    true_class INT NOT NULL,
    predicted_class INT NOT NULL,
    count INT NOT NULL CHECK (count >= 0),
    UNIQUE(result_id, true_class, predicted_class)
);

-- ============================================
-- Leader Models Table
-- LCCDE-specific: stores the best performing base model for each attack type
-- ============================================
CREATE TABLE leader_models (
    leader_id SERIAL PRIMARY KEY,
    experiment_id INT REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    type_id INT REFERENCES attack_types(type_id) ON DELETE CASCADE,
    base_model_name VARCHAR(50),
    f1_score NUMERIC(7,6),
    UNIQUE(experiment_id, type_id)
);

-- ============================================
-- Performance Indexes
-- Indexes to speed up common queries
-- ============================================
CREATE INDEX idx_experiments_model_id ON experiments(model_id);
CREATE INDEX idx_experiments_dataset_id ON experiments(dataset_id);
CREATE INDEX idx_experiments_start_time ON experiments(start_time);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_results_experiment_id ON experiment_results(experiment_id);
CREATE INDEX idx_class_results_result_id ON class_results(result_id);
CREATE INDEX idx_confusion_matrix_result_id ON confusion_matrix(result_id);
CREATE INDEX idx_attack_types_dataset_id ON attack_types(dataset_id);

-- ============================================
-- Initial Data: Models
-- Insert available ML models
-- ============================================
INSERT INTO models (model_name, model_type, description) VALUES
('LCCDE', 'ensemble', 'Leader Class and Confidence Decision Ensemble'),
('LightGBM', 'base_learner', 'Light Gradient Boosting Machine'),
('XGBoost', 'base_learner', 'Extreme Gradient Boosting'),
('CatBoost', 'base_learner', 'Categorical Boosting');

-- ============================================
-- Initial Data: LCCDE Parameters
-- Data preprocessing parameters
-- ============================================
INSERT INTO model_parameters (model_id, param_name, default_value, param_type, min_value, max_value, editable, category, description) VALUES
-- Data Processing Parameters
(1, 'train_size', '0.8', 'float', 0.5, 0.9, TRUE, 'data_processing', 'Training set ratio'),
(1, 'test_size', '0.2', 'float', 0.1, 0.5, TRUE, 'data_processing', 'Test set ratio'),
(1, 'random_state', '0', 'int', 0, 999, TRUE, 'data_processing', 'Random seed for reproducibility'),
(1, 'use_smote', 'True', 'bool', NULL, NULL, TRUE, 'data_processing', 'Whether to use SMOTE oversampling'),
(1, 'smote_strategy', '{"2":1000,"4":1000}', 'dict', NULL, NULL, TRUE, 'data_processing', 'SMOTE sampling strategy (JSON format)'),
(1, 'smote_n_jobs', '-1', 'int', -1, 8, TRUE, 'data_processing', 'Number of parallel jobs for SMOTE (-1 = all CPUs)');

-- ============================================
-- Initial Data: LightGBM Parameters
-- LightGBM model training parameters
-- ============================================
INSERT INTO model_parameters (model_id, param_name, default_value, param_type, min_value, max_value, editable, category, description) VALUES
(2, 'num_leaves', '31', 'int', 20, 100, TRUE, 'model_training', 'Maximum number of leaves in one tree'),
(2, 'max_depth', '-1', 'int', -1, 20, TRUE, 'model_training', 'Maximum tree depth (-1 means no limit)'),
(2, 'learning_rate', '0.1', 'float', 0.01, 0.3, TRUE, 'model_training', 'Learning rate'),
(2, 'n_estimators', '100', 'int', 50, 500, TRUE, 'model_training', 'Number of boosting iterations'),
(2, 'min_child_samples', '20', 'int', 5, 50, TRUE, 'model_training', 'Minimum number of samples in a leaf'),
(2, 'subsample', '1.0', 'float', 0.5, 1.0, TRUE, 'model_training', 'Subsample ratio of training data'),
(2, 'colsample_bytree', '1.0', 'float', 0.5, 1.0, TRUE, 'model_training', 'Subsample ratio of features'),
(2, 'reg_alpha', '0.0', 'float', 0.0, 1.0, TRUE, 'model_training', 'L1 regularization term'),
(2, 'reg_lambda', '0.0', 'float', 0.0, 1.0, TRUE, 'model_training', 'L2 regularization term');

-- ============================================
-- Initial Data: XGBoost Parameters
-- XGBoost model training parameters
-- ============================================
INSERT INTO model_parameters (model_id, param_name, default_value, param_type, min_value, max_value, editable, category, description) VALUES
(3, 'max_depth', '6', 'int', 3, 15, TRUE, 'model_training', 'Maximum tree depth'),
(3, 'learning_rate', '0.3', 'float', 0.01, 0.5, TRUE, 'model_training', 'Learning rate (eta)'),
(3, 'n_estimators', '100', 'int', 50, 500, TRUE, 'model_training', 'Number of boosting rounds'),
(3, 'gamma', '0', 'float', 0, 5, TRUE, 'model_training', 'Minimum loss reduction required for split'),
(3, 'subsample', '1.0', 'float', 0.5, 1.0, TRUE, 'model_training', 'Subsample ratio of training instances'),
(3, 'colsample_bytree', '1.0', 'float', 0.5, 1.0, TRUE, 'model_training', 'Subsample ratio of columns'),
(3, 'min_child_weight', '1', 'int', 1, 10, TRUE, 'model_training', 'Minimum sum of instance weight in a child'),
(3, 'reg_alpha', '0', 'float', 0, 1, TRUE, 'model_training', 'L1 regularization term'),
(3, 'reg_lambda', '1', 'float', 0, 10, TRUE, 'model_training', 'L2 regularization term');

-- ============================================
-- Initial Data: CatBoost Parameters
-- CatBoost model training parameters
-- ============================================
INSERT INTO model_parameters (model_id, param_name, default_value, param_type, min_value, max_value, editable, category, description) VALUES
(4, 'iterations', '100', 'int', 50, 500, TRUE, 'model_training', 'Maximum number of trees'),
(4, 'learning_rate', '0.03', 'float', 0.01, 0.3, TRUE, 'model_training', 'Learning rate'),
(4, 'depth', '6', 'int', 4, 10, TRUE, 'model_training', 'Depth of the tree'),
(4, 'l2_leaf_reg', '3', 'float', 1, 10, TRUE, 'model_training', 'L2 regularization coefficient'),
(4, 'boosting_type', 'Plain', 'string', NULL, NULL, TRUE, 'model_training', 'Boosting scheme (Plain/Ordered)'),
(4, 'border_count', '128', 'int', 32, 255, TRUE, 'model_training', 'Number of splits for numerical features'),
(4, 'verbose', '0', 'int', 0, 1, TRUE, 'model_training', 'Verbosity of logging (0=silent, 1=verbose)');

-- ============================================
-- Initial Data: Sample Dataset
-- Insert CICIDS2017 dataset information
-- ============================================
INSERT INTO datasets (dataset_name, filename, file_path, source, feature_count, sample_count, description) VALUES
('CICIDS2017', 'CICIDS2017_sample_km.csv', './data/CICIDS2017_sample_km.csv', 
 'https://www.unb.ca/cic/datasets/ids-2017.html', 
 78, 26800, 
 'Canadian Institute for Cybersecurity IDS 2017 dataset - External vehicular network intrusion detection dataset');

-- ============================================
-- Initial Data: Attack Types for CICIDS2017
-- Insert attack type classifications
-- ============================================
INSERT INTO attack_types (dataset_id, type_name, type_code, sample_count) VALUES
(1, 'BENIGN', 0, 18225),
(1, 'Bot', 1, 1966),
(1, 'BruteForce', 2, 96),
(1, 'DoS', 3, 3042),
(1, 'Infiltration', 4, 36),
(1, 'PortScan', 5, 1255),
(1, 'WebAttack', 6, 2180);

-- ============================================
-- Sample Queries
-- Common queries for use case support
-- ============================================

-- Query 1: Get all editable parameters for LCCDE model
-- SELECT param_name, default_value, param_type, description
-- FROM model_parameters
-- WHERE model_id = 1 AND editable = TRUE
-- ORDER BY category, param_name;

-- Query 2: Get recent experiments with their results
-- SELECT e.experiment_id, e.experiment_name, e.start_time, 
--        m.model_name, d.dataset_name,
--        r.overall_f1_score, r.overall_accuracy
-- FROM experiments e
-- JOIN models m ON e.model_id = m.model_id
-- JOIN datasets d ON e.dataset_id = d.dataset_id
-- LEFT JOIN experiment_results r ON e.experiment_id = r.experiment_id
-- WHERE e.status = 'completed'
-- ORDER BY e.start_time DESC
-- LIMIT 10;

-- Query 3: Compare class-wise F1-scores between two experiments
-- SELECT 
--     at.type_name,
--     cr1.f1_score as experiment_1_f1,
--     cr2.f1_score as experiment_2_f1,
--     ROUND((cr2.f1_score - cr1.f1_score)::numeric, 6) as improvement
-- FROM class_results cr1
-- JOIN class_results cr2 ON cr1.type_id = cr2.type_id
-- JOIN attack_types at ON cr1.type_id = at.type_id
-- JOIN experiment_results r1 ON cr1.result_id = r1.result_id
-- JOIN experiment_results r2 ON cr2.result_id = r2.result_id
-- WHERE r1.experiment_id = 1 AND r2.experiment_id = 2
-- ORDER BY at.type_code;

-- ============================================
-- End of Schema
-- ============================================