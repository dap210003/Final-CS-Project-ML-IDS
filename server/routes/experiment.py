from flask import Blueprint, request, jsonify
from services.ml_service import MLService
from models.database import db

experiments_bp = Blueprint('experiments', __name__)
ml_service = MLService()

@experiments_bp.route('/api/experiments', methods=['POST'])
def create_experiment():
    """
    Create and run a new experiment
    USE CASE 1
    
    Request body:
    {
        "model_id": 1,
        "dataset_id": 1,
        "experiment_name": "Test Run 1",
        "parameters": {
            "train_size": "0.8",
            "test_size": "0.2",
            "use_smote": "True",
            ...
        }
    }
    """
    try:
        data = request.get_json()
        
        model_id = data.get('model_id')
        dataset_id = data.get('dataset_id')
        parameters = data.get('parameters', {})
        experiment_name = data.get('experiment_name')
        
        # Validate required fields
        if not model_id or not dataset_id:
            return jsonify({'error': 'model_id and dataset_id are required'}), 400
            
        # Create and run experiment
        result = ml_service.create_experiment(
            model_id, dataset_id, parameters, experiment_name
        )
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@experiments_bp.route('/api/experiments', methods=['GET'])
def get_experiments():
    """
    Get list of recent experiments
    
    Query params:
        limit: Number of experiments (default 10)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        experiments = ml_service.get_recent_experiments(limit)
        
        return jsonify(experiments), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@experiments_bp.route('/api/experiments/<int:experiment_id>', methods=['GET'])
def get_experiment(experiment_id):
    """
    Get detailed information about a specific experiment
    USE CASE 2
    """
    try:
        experiment = ml_service.get_experiment_details(experiment_id)
        return jsonify(experiment), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@experiments_bp.route('/api/experiments/compare', methods=['POST'])
def compare_experiments():
    """
    Compare two experiments side by side
    USE CASE 2
    
    Request body:
    {
        "experiment_id_1": 1,
        "experiment_id_2": 2
    }
    """
    try:
        data = request.get_json()
        
        exp_id_1 = data.get('experiment_id_1')
        exp_id_2 = data.get('experiment_id_2')
        
        if not exp_id_1 or not exp_id_2:
            return jsonify({'error': 'Both experiment IDs are required'}), 400
            
        comparison = ml_service.compare_experiments(exp_id_1, exp_id_2)
        
        return jsonify(comparison), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500