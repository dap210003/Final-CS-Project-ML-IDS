-- Seed Data for LCCDE Project

-- Insert LCCDE model
INSERT INTO models (model_name, description)
VALUES ('LCCDE', 'Leader Class and Confidence-based Data Ensemble for intrusion detection');

-- Insert CICIDS2017 dataset
INSERT INTO datasets (filename, source, feature_count, label_count)
VALUES ('cicids2017_sample.csv', 'CIC-IDS2017', 78, 15);

-- Insert model parameters for LCCDE
INSERT INTO model_parameters (model_id, param_name, param_value, param_type, editable, description)
VALUES 
  (1, 'learning_rate', '0.01', 'float', true, 'Controls model convergence speed'),
  (1, 'batch_size', '32', 'int', true, 'Number of samples per training batch'),
  (1, 'epochs', '10', 'int', true, 'Number of training epochs'),
  (1, 'random_seed', '42', 'int', true, 'Random seed for reproducibility');
