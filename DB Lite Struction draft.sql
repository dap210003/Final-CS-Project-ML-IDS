-- Lightweight IDS Experiment Database Schema
-- 轻量化IDS实验数据库架构

-- Attack Labels
-- 攻击标签表
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

-- ML Models
CREATE TABLE ml_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Datasets
CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    record_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experiments (Training Runs)
CREATE TABLE experiments (
    experiment_id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES ml_models(model_id),
    dataset_id INTEGER REFERENCES datasets(dataset_id),
    experiment_date DATE NOT NULL,
    learning_rate NUMERIC(6,4),
    batch_size INTEGER,
    random_seed INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experiment Results
CREATE TABLE experiment_results (
    result_id SERIAL PRIMARY KEY,
    experiment_id INTEGER REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    accuracy NUMERIC(5,4),
    precision_score NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    roc_curve_data JSONB,
    confusion_matrix JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Performance (Per Attack Type)
CREATE TABLE class_performance (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES experiment_results(result_id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES attack_labels(id),
    precision_score NUMERIC(5,4),
    recall_score NUMERIC(5,4),
    f1_score NUMERIC(5,4),
    support INTEGER
);

-- LCCDE Base Models Association
CREATE TABLE lccde_base_models (
    id SERIAL PRIMARY KEY,
    lccde_experiment_id INTEGER REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    base_model_id INTEGER REFERENCES ml_models(model_id),
    base_experiment_id INTEGER REFERENCES experiments(experiment_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_flow_label_id ON flow_records(label_id);
CREATE INDEX idx_flow_timestamp ON flow_records(timestamp);
CREATE INDEX idx_experiments_date ON experiments(experiment_date DESC);
CREATE INDEX idx_experiments_model ON experiments(model_id);
CREATE INDEX idx_experiment_results_exp ON experiment_results(experiment_id);
CREATE INDEX idx_class_performance_result ON class_performance(result_id);
CREATE INDEX idx_lccde_base_models_lccde ON lccde_base_models(lccde_experiment_id);

-- Initial Data
INSERT INTO attack_labels (label_name) VALUES
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

INSERT INTO ml_models (model_name, model_type) VALUES
('LightGBM', 'gradient_boosting'),
('XGBoost', 'gradient_boosting'),
('CatBoost', 'gradient_boosting'),
('LCCDE', 'ensemble');

INSERT INTO datasets (dataset_name, file_path, record_count) VALUES
('CICIDS2017', '/data/cicids2017.csv', 2830743);

-- View for Experiment List
CREATE VIEW v_experiment_list AS
SELECT 
    e.experiment_id,
    e.experiment_date AS date,
    m.model_name AS model,
    d.dataset_name AS dataset,
    e.learning_rate,
    e.batch_size,
    e.random_seed,
    er.accuracy,
    er.precision_score AS precision,
    er.f1_score,
    er.roc_curve_data,
    er.confusion_matrix
FROM experiments e
JOIN ml_models m ON e.model_id = m.model_id
JOIN datasets d ON e.dataset_id = d.dataset_id
LEFT JOIN experiment_results er ON e.experiment_id = er.experiment_id
WHERE e.status = 'completed'
ORDER BY e.experiment_date DESC;

-- View for Class-wise Performance
CREATE VIEW v_class_performance AS
SELECT 
    e.experiment_id,
    al.label_name AS attack_type,
    cp.precision_score,
    cp.recall_score,
    cp.f1_score,
    cp.support
FROM class_performance cp
JOIN experiment_results er ON cp.result_id = er.result_id
JOIN experiments e ON er.experiment_id = e.experiment_id
JOIN attack_labels al ON cp.label_id = al.id
ORDER BY e.experiment_id, al.label_name;