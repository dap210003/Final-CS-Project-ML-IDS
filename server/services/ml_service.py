import json
import os
from datetime import datetime
from config import Config
from services.lccde_service import LCCDEService
from models.database import db

class MLService:
    """
    Main ML service for experiment management
    Coordinates between LCCDE service and database
    """
    
    def __init__(self):
        self.lccde = LCCDEService()
        
    def get_model_parameters(self, model_id):
        """
        Get editable parameters for a model
        USE CASE 1: Parameter configuration
        
        Args:
            model_id: Model ID from database
            
        Returns:
            List of parameter configurations
        """
        query = """
            SELECT param_name, default_value, param_type, 
                   min_value, max_value, category, description
            FROM model_parameters
            WHERE model_id = %s AND editable = TRUE
            ORDER BY category, param_name
        """
        
        parameters = db.execute_query(query, (model_id,))
        return parameters
        
    def create_experiment(self, model_id, dataset_id, parameters, experiment_name=None):
        """
        Create a new experiment and run training
        USE CASE 1: Run experiment
        
        Args:
            model_id: Model ID
            dataset_id: Dataset ID
            parameters: User-configured parameters (dict)
            experiment_name: Optional experiment name
            
        Returns:
            Experiment ID and results
        """
        # Get dataset information
        dataset_query = "SELECT file_path FROM datasets WHERE dataset_id = %s"
        dataset = db.execute_query(dataset_query, (dataset_id,))[0]
        dataset_path = dataset['file_path']
        
        # Create experiment record
        exp_query = """
            INSERT INTO experiments (experiment_name, model_id, dataset_id, start_time, status)
            VALUES (%s, %s, %s, %s, 'running')
            RETURNING experiment_id
        """
        experiment_id = db.execute_insert(
            exp_query, 
            (experiment_name, model_id, dataset_id, datetime.now())
        )
        
        # Save experiment parameters
        for param_name, param_value in parameters.items():
            param_query = """
                INSERT INTO experiment_parameters (experiment_id, param_name, param_value)
                VALUES (%s, %s, %s)
            """
            db.execute_query(param_query, (experiment_id, param_name, str(param_value)), fetch=False)
            
        try:
            # Run training
            results = self.run_lccde_training(dataset_path, parameters, experiment_id)
            
            # Update experiment status
            update_query = """
                UPDATE experiments 
                SET end_time = %s, status = 'completed'
                WHERE experiment_id = %s
            """
            db.execute_query(update_query, (datetime.now(), experiment_id), fetch=False)
            
            return {
                'experiment_id': experiment_id,
                'status': 'completed',
                'results': results
            }
            
        except Exception as e:
            # Update experiment with error
            error_query = """
                UPDATE experiments 
                SET end_time = %s, status = 'failed', error_message = %s
                WHERE experiment_id = %s
            """
            db.execute_query(error_query, (datetime.now(), str(e), experiment_id), fetch=False)
            
            raise e
            
    def run_lccde_training(self, dataset_path, parameters, experiment_id):
        """
        Execute LCCDE training pipeline
        
        Args:
            dataset_path: Path to dataset CSV
            parameters: Training parameters
            experiment_id: Experiment ID for saving results
            
        Returns:
            Training results dictionary
        """
        start_time = datetime.now()
        
        # Step 1: Load and prepare data
        train_size = float(parameters.get('train_size', 0.8))
        random_state = int(parameters.get('random_state', 0))
        
        X_train, X_test, y_train, y_test = self.lccde.load_and_prepare_data(
            dataset_path, train_size, random_state
        )
        
        # Step 2: Apply SMOTE if enabled
        use_smote = parameters.get('use_smote', 'True') == 'True'
        if use_smote:
            smote_strategy_str = parameters.get('smote_strategy', '{"2":1000,"4":1000}')
            smote_strategy = json.loads(smote_strategy_str)
            # Convert string keys to integers
            smote_strategy = {int(k): v for k, v in smote_strategy.items()}
            
            X_train, y_train = self.lccde.apply_smote(X_train, y_train, smote_strategy)
            
        # Step 3: Train base models
        training_start = datetime.now()
        self.lccde.train_base_models(X_train, y_train)
        training_time = datetime.now() - training_start
        
        # Step 4: Evaluate base models
        evaluation_results = self.lccde.evaluate_base_models(X_test, y_test)
        
        # Step 5: Find leader models for each class
        self.lccde.find_leader_models(evaluation_results)
        
        # Step 6: LCCDE prediction
        prediction_start = datetime.now()
        y_true, y_pred = self.lccde.lccde_predict(X_test, y_test)
        prediction_time = datetime.now() - prediction_start
        
        # Step 7: Calculate final metrics
        final_metrics = self.lccde.calculate_metrics(y_true, y_pred)
        
        # Step 8: Save results to database
        self.save_experiment_results(
            experiment_id, 
            final_metrics, 
            training_time, 
            prediction_time,
            evaluation_results
        )
        
        return final_metrics
        
    def save_experiment_results(self, experiment_id, metrics, training_time, 
                                prediction_time, evaluation_results):
        """
        Save experiment results to database
        
        Args:
            experiment_id: Experiment ID
            metrics: Calculated metrics
            training_time: Training duration
            prediction_time: Prediction duration
            evaluation_results: Base model evaluation results
        """
        # Insert overall results
        result_query = """
            INSERT INTO experiment_results 
            (experiment_id, overall_accuracy, overall_precision, 
             overall_recall, overall_f1_score, training_time, prediction_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING result_id
        """
        result_id = db.execute_insert(result_query, (
            experiment_id,
            metrics['overall_accuracy'],
            metrics['overall_precision'],
            metrics['overall_recall'],
            metrics['overall_f1_score'],
            training_time,
            prediction_time
        ))
        
        # Insert class-wise results
        class_report = metrics['classification_report']
        for class_label, class_metrics in class_report.items():
            if class_label.isdigit():  # Only process numeric class labels
                # Get type_id from attack_types table
                type_query = """
                    SELECT type_id FROM attack_types 
                    WHERE type_code = %s 
                    AND dataset_id = (
                        SELECT dataset_id FROM experiments WHERE experiment_id = %s
                    )
                """
                type_result = db.execute_query(type_query, (int(class_label), experiment_id))
                
                if type_result:
                    type_id = type_result[0]['type_id']
                    
                    class_query = """
                        INSERT INTO class_results 
                        (result_id, type_id, precision, recall, f1_score, support)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    db.execute_query(class_query, (
                        result_id,
                        type_id,
                        class_metrics.get('precision', 0),
                        class_metrics.get('recall', 0),
                        class_metrics.get('f1-score', 0),
                        class_metrics.get('support', 0)
                    ), fetch=False)
                    
        # Insert confusion matrix
        cm = metrics['confusion_matrix']
        for true_idx, row in enumerate(cm):
            for pred_idx, count in enumerate(row):
                if count > 0:
                    cm_query = """
                        INSERT INTO confusion_matrix 
                        (result_id, true_class, predicted_class, count)
                        VALUES (%s, %s, %s, %s)
                    """
                    db.execute_query(cm_query, (result_id, true_idx, pred_idx, count), fetch=False)
                    
        # Save leader models information
        for class_idx, leader_model in enumerate(self.lccde.leader_models):
            # Determine which base model is the leader
            leader_name = None
            for model_name, model in self.lccde.models.items():
                if model == leader_model:
                    leader_name = model_name
                    break
                    
            if leader_name:
                # Get type_id
                type_query = """
                    SELECT type_id FROM attack_types 
                    WHERE type_code = %s 
                    AND dataset_id = (
                        SELECT dataset_id FROM experiments WHERE experiment_id = %s
                    )
                """
                type_result = db.execute_query(type_query, (class_idx, experiment_id))
                
                if type_result:
                    type_id = type_result[0]['type_id']
                    f1 = metrics['f1_per_class'][class_idx]
                    
                    leader_query = """
                        INSERT INTO leader_models 
                        (experiment_id, type_id, base_model_name, f1_score)
                        VALUES (%s, %s, %s, %s)
                    """
                    db.execute_query(leader_query, (experiment_id, type_id, leader_name, f1), fetch=False)
                    
    def get_experiment_details(self, experiment_id):
        """
        Get complete experiment details
        USE CASE 2: View experiment
        
        Args:
            experiment_id: Experiment ID
            
        Returns:
            Complete experiment information
        """
        # Get basic experiment info
        exp_query = """
            SELECT e.*, m.model_name, d.dataset_name,
                   r.overall_accuracy, r.overall_precision,
                   r.overall_recall, r.overall_f1_score,
                   r.training_time, r.prediction_time
            FROM experiments e
            JOIN models m ON e.model_id = m.model_id
            JOIN datasets d ON e.dataset_id = d.dataset_id
            LEFT JOIN experiment_results r ON e.experiment_id = r.experiment_id
            WHERE e.experiment_id = %s
        """
        experiment = db.execute_query(exp_query, (experiment_id,))[0]
        
        # Get parameters
        param_query = """
            SELECT param_name, param_value
            FROM experiment_parameters
            WHERE experiment_id = %s
        """
        parameters = db.execute_query(param_query, (experiment_id,))
        experiment['parameters'] = {p['param_name']: p['param_value'] for p in parameters}
        
        # Get class-wise results
        class_query = """
            SELECT at.type_name, at.type_code,
                   cr.precision, cr.recall, cr.f1_score, cr.support
            FROM class_results cr
            JOIN experiment_results r ON cr.result_id = r.result_id
            JOIN attack_types at ON cr.type_id = at.type_id
            WHERE r.experiment_id = %s
            ORDER BY at.type_code
        """
        class_results = db.execute_query(class_query, (experiment_id,))
        experiment['class_results'] = class_results
        
        # Get confusion matrix
        cm_query = """
            SELECT true_class, predicted_class, count
            FROM confusion_matrix cm
            JOIN experiment_results r ON cm.result_id = r.result_id
            WHERE r.experiment_id = %s
        """
        cm_data = db.execute_query(cm_query, (experiment_id,))
        experiment['confusion_matrix'] = cm_data
        
        return experiment
        
    def compare_experiments(self, experiment_id_1, experiment_id_2):
        """
        Compare two experiments side by side
        USE CASE 2: Compare experiments
        
        Args:
            experiment_id_1: First experiment ID
            experiment_id_2: Second experiment ID
            
        Returns:
            Comparison data structure
        """
        exp1 = self.get_experiment_details(experiment_id_1)
        exp2 = self.get_experiment_details(experiment_id_2)
        
        # Calculate parameter differences
        param_diff = {}
        all_params = set(exp1['parameters'].keys()) | set(exp2['parameters'].keys())
        for param in all_params:
            val1 = exp1['parameters'].get(param)
            val2 = exp2['parameters'].get(param)
            if val1 != val2:
                param_diff[param] = {
                    'experiment_1': val1,
                    'experiment_2': val2
                }
                
        # Calculate metric improvements
        metric_comparison = {
            'accuracy': {
                'experiment_1': exp1.get('overall_accuracy'),
                'experiment_2': exp2.get('overall_accuracy'),
                'difference': exp2.get('overall_accuracy', 0) - exp1.get('overall_accuracy', 0)
            },
            'precision': {
                'experiment_1': exp1.get('overall_precision'),
                'experiment_2': exp2.get('overall_precision'),
                'difference': exp2.get('overall_precision', 0) - exp1.get('overall_precision', 0)
            },
            'recall': {
                'experiment_1': exp1.get('overall_recall'),
                'experiment_2': exp2.get('overall_recall'),
                'difference': exp2.get('overall_recall', 0) - exp1.get('overall_recall', 0)
            },
            'f1_score': {
                'experiment_1': exp1.get('overall_f1_score'),
                'experiment_2': exp2.get('overall_f1_score'),
                'difference': exp2.get('overall_f1_score', 0) - exp1.get('overall_f1_score', 0)
            }
        }
        
        # Compare class-wise F1 scores
        class_comparison = []
        for i, class1 in enumerate(exp1['class_results']):
            class2 = exp2['class_results'][i]
            class_comparison.append({
                'class_name': class1['type_name'],
                'experiment_1_f1': class1['f1_score'],
                'experiment_2_f1': class2['f1_score'],
                'improvement': class2['f1_score'] - class1['f1_score']
            })
            
        return {
            'experiment_1': exp1,
            'experiment_2': exp2,
            'parameter_differences': param_diff,
            'metric_comparison': metric_comparison,
            'class_comparison': class_comparison
        }
        
    def get_recent_experiments(self, limit=10):
        """
        Get list of recent experiments
        
        Args:
            limit: Number of experiments to return
            
        Returns:
            List of experiments
        """
        query = """
            SELECT e.experiment_id, e.experiment_name, e.start_time, e.end_time, e.status,
                   m.model_name, d.dataset_name,
                   r.overall_f1_score, r.overall_accuracy
            FROM experiments e
            JOIN models m ON e.model_id = m.model_id
            JOIN datasets d ON e.dataset_id = d.dataset_id
            LEFT JOIN experiment_results r ON e.experiment_id = r.experiment_id
            WHERE e.status = 'completed'
            ORDER BY e.start_time DESC
            LIMIT %s
        """
        
        experiments = db.execute_query(query, (limit,))
        return experiments