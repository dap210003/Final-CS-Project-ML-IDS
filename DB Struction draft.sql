-- Attack Labels
CREATE TABLE attack_labels (
    id SERIAL PRIMARY KEY,
    label_name VARCHAR(50) UNIQUE NOT NULL
);

-- Flow Records (Core)
CREATE TABLE flow_records (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) UNIQUE,
    src_ip VARCHAR(45),
    dst_ip VARCHAR(45),
    src_port INT,
    dst_port INT,
    protocol VARCHAR(10),
    timestamp TIMESTAMP,
    label_id INT REFERENCES attack_labels(id) ON DELETE SET NULL
);

-- Flow Time Statistics
CREATE TABLE flow_time_stats (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) REFERENCES flow_records(flow_id) ON DELETE CASCADE,
    flow_duration BIGINT,
    flow_iat_mean DOUBLE PRECISION,
    flow_iat_std DOUBLE PRECISION,
    flow_iat_max BIGINT,
    flow_iat_min BIGINT,
    flow_bytes_per_s DOUBLE PRECISION,
    flow_packets_per_s DOUBLE PRECISION
);

-- Forward Traffic Stats
CREATE TABLE fwd_stats (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) REFERENCES flow_records(flow_id) ON DELETE CASCADE,
    total_fwd_packets INT,
    fwd_packet_length_mean DOUBLE PRECISION,
    fwd_packet_length_std DOUBLE PRECISION,
    fwd_iat_total BIGINT,
    fwd_iat_mean DOUBLE PRECISION,
    fwd_iat_std DOUBLE PRECISION,
    fwd_iat_max BIGINT,
    fwd_iat_min BIGINT,
    fwd_psh_flags INT,
    fwd_urg_flags INT,
    fwd_header_length INT
);

-- Backward Traffic Stats
CREATE TABLE bwd_stats (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) REFERENCES flow_records(flow_id) ON DELETE CASCADE,
    total_bwd_packets INT,
    bwd_packet_length_mean DOUBLE PRECISION,
    bwd_packet_length_std DOUBLE PRECISION,
    bwd_iat_total BIGINT,
    bwd_iat_mean DOUBLE PRECISION,
    bwd_iat_std DOUBLE PRECISION,
    bwd_iat_max BIGINT,
    bwd_iat_min BIGINT,
    bwd_psh_flags INT,
    bwd_urg_flags INT,
    bwd_header_length INT
);

-- Flag & Header Info
CREATE TABLE flags_info (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) REFERENCES flow_records(flow_id) ON DELETE CASCADE,
    fin_flag_count INT,
    syn_flag_count INT,
    rst_flag_count INT,
    psh_flag_count INT,
    ack_flag_count INT,
    urg_flag_count INT,
    cwe_flag_count INT,
    ece_flag_count INT
);

-- Activity / Idle Stats
CREATE TABLE activity_stats (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(100) REFERENCES flow_records(flow_id) ON DELETE CASCADE,
    active_mean DOUBLE PRECISION,
    active_std DOUBLE PRECISION,
    active_max INT,
    active_min INT,
    idle_mean DOUBLE PRECISION,
    idle_std DOUBLE PRECISION,
    idle_max INT,
    idle_min INT
);

-- Users Table: Storage system user information
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user'
);

-- ML Models: Table Storage supported ML model types
CREATE TABLE ml_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Parameters Table: Stores configurable parameter definitions for each model
CREATE TABLE model_parameters (
    parameter_id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES ml_models(model_id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_type VARCHAR(50) NOT NULL,
    default_value VARCHAR(255),
    min_value NUMERIC,
    max_value NUMERIC,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    UNIQUE(model_id, parameter_name)
);

-- Datasets Table: Stores available training dataset metadata
CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(100),
    source_type VARCHAR(50),
    file_path VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT,
    record_count INTEGER,
    feature_count INTEGER,
    description TEXT,
    uploaded_by INTEGER REFERENCES users(user_id)
);

-- Training Runs Table: Store records of each model training/run
CREATE TABLE training_runs (
    run_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES ml_models(model_id),
    dataset_id INTEGER REFERENCES datasets(dataset_id),
    run_name VARCHAR(255),
    run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    execution_time_seconds NUMERIC,
    error_message TEXT
);

-- Run Parameters Table: Stores the specific parameter values ​​used for each run
CREATE TABLE run_parameters (
    run_parameter_id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    parameter_id INTEGER REFERENCES model_parameters(parameter_id),
    parameter_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Preprocessing Config Table: Store data preprocessing parameters
CREATE TABLE preprocessing_config (
    config_id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    train_test_split_ratio NUMERIC(3,2) DEFAULT 0.80,
    random_state INTEGER,
    use_smote BOOLEAN DEFAULT FALSE,
    smote_strategy JSONB,
    feature_scaling_method VARCHAR(50),
    n_jobs INTEGER DEFAULT -1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Run Results Table : Store the performance metrics of this model run
CREATE TABLE run_results (
    result_id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    accuracy NUMERIC(5,4),
    precision_score NUMERIC(5,4),
    recall_score NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    confusion_matrix JSONB,
    class_wise_metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Performance Table: Stores detailed detection performance for each attack type
CREATE TABLE class_performance (
    class_performance_id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES run_results(result_id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES attack_labels(id),
    precision_score NUMERIC(5,4),
    recall_score NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    support INTEGER,
    leader_model VARCHAR(100)
);

-- Model Artifacts Table: Path to store trained model files
CREATE TABLE model_artifacts (
    artifact_id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    model_format VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Run Comparisons Table: Stores user-created run result comparison records
CREATE TABLE run_comparisons (
    comparison_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    run_id_1 INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    run_id_2 INTEGER REFERENCES training_runs(run_id) ON DELETE CASCADE,
    comparison_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- System Logs Table: Record system operation logs
CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_flow_label_id ON flow_records(label_id);
CREATE INDEX idx_flow_id_time ON flow_time_stats(flow_id);
CREATE INDEX idx_flow_id_fwd ON fwd_stats(flow_id);
CREATE INDEX idx_flow_id_bwd ON bwd_stats(flow_id);
CREATE INDEX idx_flow_id_flags ON flags_info(flow_id);
CREATE INDEX idx_flow_id_activity ON activity_stats(flow_id);
CREATE INDEX idx_training_runs_user ON training_runs(user_id);
CREATE INDEX idx_training_runs_date ON training_runs(run_date DESC);
CREATE INDEX idx_training_runs_status ON training_runs(status);
CREATE INDEX idx_run_parameters_run ON run_parameters(run_id);
CREATE INDEX idx_run_results_run ON run_results(run_id);
CREATE INDEX idx_class_performance_result ON class_performance(result_id);
CREATE INDEX idx_class_performance_label ON class_performance(label_id);
CREATE INDEX idx_model_artifacts_run ON model_artifacts(run_id);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_date ON system_logs(created_at DESC);

-- Initial Attack Labels
INSERT INTO attack_labels (label_name)
VALUES
('BENIGN'),
('DoS Hulk'),
('DoS GoldenEye'),
('PortScan'),
('DDoS'),
('Bot'),
('BruteForce'),
('Web Attack'),
('Infiltration'),
('FTP-Patator'),
('SSH-Patator'),
('Heartbleed');

-- Initialize ML Models
INSERT INTO ml_models (model_name, model_type, description) VALUES
('LightGBM', 'gradient_boosting', 'Light Gradient Boosting Machine'),
('XGBoost', 'gradient_boosting', 'Extreme Gradient Boosting'),
('CatBoost', 'gradient_boosting', 'Categorical Boosting'),
('LCCDE', 'ensemble', 'Leader Class and Confidence Decision Ensemble');

-- Initialize Model Parameters
INSERT INTO model_parameters (model_id, parameter_name, parameter_type, default_value, min_value, max_value, description, display_order) VALUES
-- LightGBM peremeter (model_id = 1) 
(1, 'num_leaves', 'integer', '31', 10, 100, 'Number of leaves', 1),
(1, 'max_depth', 'integer', '-1', -1, 20, 'Maximum tree depth', 2),
(1, 'learning_rate', 'float', '0.1', 0.01, 1.0, 'Learning rate', 3),
(1, 'n_estimators', 'integer', '100', 10, 1000, '/ Number of trees', 4),
(1, 'min_child_samples', 'integer', '20', 5, 100, 'Minimum samples in leaf', 5),
(1, 'subsample', 'float', '1.0', 0.5, 1.0, 'Training sample ratio', 6),
(1, 'colsample_bytree', 'float', '1.0', 0.5, 1.0, 'Feature sampling ratio', 7),
(1, 'reg_alpha', 'float', '0.0', 0.0, 10.0, 'L1 regularization', 8),
(1, 'reg_lambda', 'float', '0.0', 0.0, 10.0, 'L2 regularization', 9),
(1, 'min_split_gain', 'float', '0.0', 0.0, 1.0, 'Minimum split gain', 10),
(1, 'random_state', 'integer', '42', 0, 9999, 'Random seed', 11),
(1, 'n_jobs', 'integer', '-1', -1, 32, 'Number of parallel threads', 12),
-- XGBoost peremeter (model_id = 2)
(2, 'max_depth', 'integer', '6', 1, 20, 'Maximum tree depth', 1),
(2, 'learning_rate', 'float', '0.3', 0.01, 1.0, 'Learning rate', 2),
(2, 'n_estimators', 'integer', '100', 10, 1000, 'Number of trees', 3),
(2, 'gamma', 'float', '0.0', 0.0, 10.0, 'Minimum loss reduction', 4),
(2, 'min_child_weight', 'integer', '1', 1, 10, 'Minimum child weight', 5),
(2, 'subsample', 'float', '1.0', 0.5, 1.0, 'Training sample ratio', 6),
(2, 'colsample_bytree', 'float', '1.0', 0.5, 1.0, 'Column sampling ratio', 7),
(2, 'colsample_bylevel', 'float', '1.0', 0.5, 1.0, 'Column sampling per level', 8),
(2, 'reg_alpha', 'float', '0.0', 0.0, 10.0, ' L1 regularization', 9),
(2, 'reg_lambda', 'float', '1.0', 0.0, 10.0, 'L2 regularization', 10),
(2, 'scale_pos_weight', 'float', '1.0', 0.1, 10.0, 'Positive class weight', 11),
(2, 'random_state', 'integer', '42', 0, 9999, 'Random seed', 12),
(2, 'n_jobs', 'integer', '-1', -1, 32, 'Number of parallel threads', 13),
(2, 'tree_method', 'string', 'auto', NULL, NULL, 'Tree method (auto/exact/hist/gpu_hist)', 14),
-- CatBoost peremeter (model_id = 3)
(3, 'iterations', 'integer', '1000', 100, 5000, 'Number of iterations', 1),
(3, 'learning_rate', 'float', '0.03', 0.01, 1.0, 'Learning rate', 2),
(3, 'depth', 'integer', '6', 1, 16, 'Tree depth', 3),
(3, 'l2_leaf_reg', 'float', '3.0', 1.0, 10.0, 'L2 regularization', 4),
(3, 'border_count', 'integer', '254', 32, 255, 'Border count for numeric features', 5),
(3, 'bagging_temperature', 'float', '1.0', 0.0, 10.0, 'bootstrap/ Bagging temperature', 6),
(3, 'random_strength', 'float', '1.0', 0.0, 10.0, 'Random strength', 7),
(3, 'subsample', 'float', '1.0', 0.5, 1.0, 'Sample ratio', 8),
(3, 'colsample_bylevel', 'float', '1.0', 0.5, 1.0, 'Column sampling per level', 9),
(3, 'min_data_in_leaf', 'integer', '1', 1, 100, 'Minimum samples in leaf', 10),
(3, 'random_state', 'integer', '42', 0, 9999, 'Random seed', 11),
(3, 'thread_count', 'integer', '-1', -1, 32, 'Thread count', 12),
(3, 'boosting_type', 'string', 'Plain', NULL, NULL, 'Boosting type (Plain/Ordered)', 13),
(3, 'task_type', 'string', 'CPU', NULL, NULL, 'Task type (CPU/GPU)', 14),
(3, 'verbose', 'integer', '0', 0, 1, 'Verbosity level', 15);

-- Views for common queries

CREATE VIEW v_recent_runs AS
SELECT 
    tr.run_id,
    tr.run_name,
    u.username,
    m.model_name,
    d.dataset_name,
    tr.run_date,
    tr.status,
    tr.execution_time_seconds,
    rr.accuracy,
    rr.f1_score
FROM training_runs tr
JOIN users u ON tr.user_id = u.user_id
JOIN ml_models m ON tr.model_id = m.model_id
LEFT JOIN datasets d ON tr.dataset_id = d.dataset_id
LEFT JOIN run_results rr ON tr.run_id = rr.run_id
ORDER BY tr.run_date DESC;

CREATE VIEW v_model_performance_summary AS
SELECT 
    m.model_name,
    AVG(rr.accuracy) AS avg_accuracy,
    AVG(rr.precision_score) AS avg_precision,
    AVG(rr.recall_score) AS avg_recall,
    AVG(rr.f1_score) AS avg_f1_score,
    COUNT(tr.run_id) AS total_runs
FROM training_runs tr
JOIN ml_models m ON tr.model_id = m.model_id
JOIN run_results rr ON tr.run_id = rr.run_id
WHERE tr.status = 'completed'
GROUP BY m.model_name;

CREATE VIEW v_attack_detection_performance AS
SELECT 
    al.label_name,
    m.model_name,
    AVG(cp.precision_score) AS avg_precision,
    AVG(cp.recall_score) AS avg_recall,
    AVG(cp.f1_score) AS avg_f1_score,
    COUNT(cp.class_performance_id) AS sample_count
FROM class_performance cp
JOIN run_results rr ON cp.result_id = rr.result_id
JOIN training_runs tr ON rr.run_id = tr.run_id
JOIN ml_models m ON tr.model_id = m.model_id
JOIN attack_labels al ON cp.label_id = al.id
WHERE tr.status = 'completed'
GROUP BY al.label_name, m.model_name
ORDER BY al.label_name, m.model_name;