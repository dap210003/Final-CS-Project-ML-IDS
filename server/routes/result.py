from flask import Blueprint, request, jsonify
from models.database import db

results_bp = Blueprint('results', __name__)

@results_bp.route('/api/results/<int:experiment_id>', methods=['GET'])
def get_experiment_results(experiment_id):
    """
    Get complete results for a specific experiment
    USE CASE 2: View detailed results
    
    Args:
        experiment_id: Experiment ID from URL path
        
    Returns:
        JSON with overall metrics, class-wise results, and confusion matrix
    """
    try:
        # Get overall results
        overall_query = """
            SELECT r.result_id, r.overall_accuracy, r.overall_precision,
                   r.overall_recall, r.overall_f1_score,
                   r.training_time, r.prediction_time, r.timestamp
            FROM experiment_results r
            WHERE r.experiment_id = %s
        """
        overall_results = db.execute_query(overall_query, (experiment_id,))
        
        if not overall_results:
            return jsonify({'error': 'Results not found for this experiment'}), 404
            
        result = overall_results[0]
        result_id = result['result_id']
        
        # Get class-wise results with attack type names
        class_query = """
            SELECT at.type_name, at.type_code,
                   cr.precision, cr.recall, cr.f1_score, cr.support
            FROM class_results cr
            JOIN attack_types at ON cr.type_id = at.type_id
            WHERE cr.result_id = %s
            ORDER BY at.type_code
        """
        class_results = db.execute_query(class_query, (result_id,))
        
        # Get confusion matrix data
        cm_query = """
            SELECT true_class, predicted_class, count
            FROM confusion_matrix
            WHERE result_id = %s
            ORDER BY true_class, predicted_class
        """
        cm_data = db.execute_query(cm_query, (result_id,))
        
        # Transform confusion matrix into 2D array format for frontend
        if cm_data:
            max_class = max(max(row['true_class'], row['predicted_class']) for row in cm_data)
            cm_matrix = [[0] * (max_class + 1) for _ in range(max_class + 1)]
            
            for row in cm_data:
                cm_matrix[row['true_class']][row['predicted_class']] = row['count']
        else:
            cm_matrix = []
            
        # Get leader models information (LCCDE specific)
        leader_query = """
            SELECT at.type_name, at.type_code,
                   lm.base_model_name, lm.f1_score
            FROM leader_models lm
            JOIN attack_types at ON lm.type_id = at.type_id
            WHERE lm.experiment_id = %s
            ORDER BY at.type_code
        """
        leader_models = db.execute_query(leader_query, (experiment_id,))
        
        return jsonify({
            'overall_metrics': {
                'accuracy': float(result['overall_accuracy']) if result['overall_accuracy'] else None,
                'precision': float(result['overall_precision']) if result['overall_precision'] else None,
                'recall': float(result['overall_recall']) if result['overall_recall'] else None,
                'f1_score': float(result['overall_f1_score']) if result['overall_f1_score'] else None,
                'training_time': str(result['training_time']) if result['training_time'] else None,
                'prediction_time': str(result['prediction_time']) if result['prediction_time'] else None
            },
            'class_results': class_results,
            'confusion_matrix': cm_matrix,
            'leader_models': leader_models,
            'timestamp': result['timestamp'].isoformat() if result['timestamp'] else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@results_bp.route('/api/results/class/<int:experiment_id>/<int:type_code>', methods=['GET'])
def get_class_specific_results(experiment_id, type_code):
    """
    Get results for a specific attack type/class
    
    Args:
        experiment_id: Experiment ID
        type_code: Attack type code (0=BENIGN, 1=Bot, etc.)
        
    Returns:
        Detailed metrics for the specified class
    """
    try:
        query = """
            SELECT at.type_name, at.type_code,
                   cr.precision, cr.recall, cr.f1_score, cr.support,
                   lm.base_model_name as leader_model
            FROM class_results cr
            JOIN experiment_results r ON cr.result_id = r.result_id
            JOIN attack_types at ON cr.type_id = at.type_id
            LEFT JOIN leader_models lm ON lm.type_id = at.type_id 
                AND lm.experiment_id = r.experiment_id
            WHERE r.experiment_id = %s AND at.type_code = %s
        """
        
        result = db.execute_query(query, (experiment_id, type_code))
        
        if not result:
            return jsonify({'error': 'Class results not found'}), 404
            
        return jsonify(result[0]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@results_bp.route('/api/results/confusion-matrix/<int:experiment_id>', methods=['GET'])
def get_confusion_matrix(experiment_id):
    """
    Get confusion matrix data for visualization
    
    Args:
        experiment_id: Experiment ID
        
    Returns:
        Confusion matrix in 2D array format with class labels
    """
    try:
        # Get result_id
        result_query = """
            SELECT result_id FROM experiment_results
            WHERE experiment_id = %s
        """
        result = db.execute_query(result_query, (experiment_id,))
        
        if not result:
            return jsonify({'error': 'Results not found'}), 404
            
        result_id = result[0]['result_id']
        
        # Get confusion matrix data
        cm_query = """
            SELECT true_class, predicted_class, count
            FROM confusion_matrix
            WHERE result_id = %s
        """
        cm_data = db.execute_query(cm_query, (result_id,))
        
        # Get class labels
        label_query = """
            SELECT DISTINCT at.type_code, at.type_name
            FROM attack_types at
            JOIN experiments e ON at.dataset_id = e.dataset_id
            WHERE e.experiment_id = %s
            ORDER BY at.type_code
        """
        labels = db.execute_query(label_query, (experiment_id,))
        
        # Build confusion matrix
        num_classes = len(labels)
        cm_matrix = [[0] * num_classes for _ in range(num_classes)]
        
        for row in cm_data:
            cm_matrix[row['true_class']][row['predicted_class']] = row['count']
            
        return jsonify({
            'matrix': cm_matrix,
            'labels': [label['type_name'] for label in labels],
            'class_codes': [label['type_code'] for label in labels]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@results_bp.route('/api/results/leader-models/<int:experiment_id>', methods=['GET'])
def get_leader_models(experiment_id):
    """
    Get leader model information for LCCDE experiments
    Shows which base model performed best for each attack type
    
    Args:
        experiment_id: Experiment ID
        
    Returns:
        List of leader models for each class
    """
    try:
        query = """
            SELECT at.type_name, at.type_code,
                   lm.base_model_name, lm.f1_score
            FROM leader_models lm
            JOIN attack_types at ON lm.type_id = at.type_id
            WHERE lm.experiment_id = %s
            ORDER BY at.type_code
        """
        
        leader_models = db.execute_query(query, (experiment_id,))
        
        return jsonify(leader_models), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@results_bp.route('/api/results/compare-metrics', methods=['POST'])
def compare_metrics():
    """
    Compare metrics between two experiments for visualization
    USE CASE 2: Side-by-side metric comparison
    
    Request body:
    {
        "experiment_id_1": 1,
        "experiment_id_2": 2
    }
    
    Returns:
        Structured comparison data for charts
    """
    try:
        data = request.get_json()
        exp_id_1 = data.get('experiment_id_1')
        exp_id_2 = data.get('experiment_id_2')
        
        if not exp_id_1 or not exp_id_2:
            return jsonify({'error': 'Both experiment IDs required'}), 400
            
        # Get metrics for both experiments
        metrics_query = """
            SELECT e.experiment_id, e.experiment_name,
                   r.overall_accuracy, r.overall_precision,
                   r.overall_recall, r.overall_f1_score
            FROM experiments e
            JOIN experiment_results r ON e.experiment_id = r.experiment_id
            WHERE e.experiment_id IN (%s, %s)
        """
        
        metrics = db.execute_query(metrics_query, (exp_id_1, exp_id_2))
        
        if len(metrics) < 2:
            return jsonify({'error': 'One or both experiments not found'}), 404
            
        # Get class-wise F1 scores for both
        class_query = """
            SELECT at.type_name, at.type_code, cr.f1_score, r.experiment_id
            FROM class_results cr
            JOIN experiment_results r ON cr.result_id = r.result_id
            JOIN attack_types at ON cr.type_id = at.type_id
            WHERE r.experiment_id IN (%s, %s)
            ORDER BY at.type_code, r.experiment_id
        """
        
        class_results = db.execute_query(class_query, (exp_id_1, exp_id_2))
        
        # Structure class results for comparison
        class_comparison = {}
        for row in class_results:
            class_name = row['type_name']
            if class_name not in class_comparison:
                class_comparison[class_name] = {
                    'type_code': row['type_code'],
                    'experiment_1': None,
                    'experiment_2': None
                }
            
            if row['experiment_id'] == exp_id_1:
                class_comparison[class_name]['experiment_1'] = float(row['f1_score'])
            else:
                class_comparison[class_name]['experiment_2'] = float(row['f1_score'])
                
        # Calculate differences
        for class_name in class_comparison:
            f1_1 = class_comparison[class_name]['experiment_1']
            f1_2 = class_comparison[class_name]['experiment_2']
            if f1_1 is not None and f1_2 is not None:
                class_comparison[class_name]['difference'] = f1_2 - f1_1
                class_comparison[class_name]['improvement_percent'] = ((f1_2 - f1_1) / f1_1 * 100) if f1_1 > 0 else 0
                
        return jsonify({
            'overall_comparison': {
                'experiment_1': {
                    'id': metrics[0]['experiment_id'],
                    'name': metrics[0]['experiment_name'],
                    'accuracy': float(metrics[0]['overall_accuracy']) if metrics[0]['overall_accuracy'] else None,
                    'precision': float(metrics[0]['overall_precision']) if metrics[0]['overall_precision'] else None,
                    'recall': float(metrics[0]['overall_recall']) if metrics[0]['overall_recall'] else None,
                    'f1_score': float(metrics[0]['overall_f1_score']) if metrics[0]['overall_f1_score'] else None
                },
                'experiment_2': {
                    'id': metrics[1]['experiment_id'],
                    'name': metrics[1]['experiment_name'],
                    'accuracy': float(metrics[1]['overall_accuracy']) if metrics[1]['overall_accuracy'] else None,
                    'precision': float(metrics[1]['overall_precision']) if metrics[1]['overall_precision'] else None,
                    'recall': float(metrics[1]['overall_recall']) if metrics[1]['overall_recall'] else None,
                    'f1_score': float(metrics[1]['overall_f1_score']) if metrics[1]['overall_f1_score'] else None
                }
            },
            'class_comparison': class_comparison
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@results_bp.route('/api/results/export/<int:experiment_id>', methods=['GET'])
def export_results(experiment_id):
    """
    Export complete experiment results in structured format
    Can be used for downloading or further analysis
    
    Args:
        experiment_id: Experiment ID
        
    Returns:
        Complete results package
    """
    try:
        # Get experiment details
        exp_query = """
            SELECT e.*, m.model_name, d.dataset_name
            FROM experiments e
            JOIN models m ON e.model_id = m.model_id
            JOIN datasets d ON e.dataset_id = d.dataset_id
            WHERE e.experiment_id = %s
        """
        experiment = db.execute_query(exp_query, (experiment_id,))
        
        if not experiment:
            return jsonify({'error': 'Experiment not found'}), 404
            
        # Get parameters
        param_query = """
            SELECT param_name, param_value
            FROM experiment_parameters
            WHERE experiment_id = %s
        """
        parameters = db.execute_query(param_query, (experiment_id,))
        
        # Get all results using the existing endpoint logic
        # This reuses the get_experiment_results logic
        from services.ml_service import MLService
        ml_service = MLService()
        complete_data = ml_service.get_experiment_details(experiment_id)
        
        return jsonify({
            'experiment_info': experiment[0],
            'parameters': {p['param_name']: p['param_value'] for p in parameters},
            'results': complete_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500