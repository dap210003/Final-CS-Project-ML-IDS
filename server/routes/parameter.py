from flask import Blueprint, jsonify
from services.ml_service import MLService

parameters_bp = Blueprint('parameters', __name__)
ml_service = MLService()

@parameters_bp.route('/api/models/<int:model_id>/parameters', methods=['GET'])
def get_model_parameters(model_id):
    """
    Get editable parameters for a specific model
    USE CASE 1
    
    Returns parameter configuration for frontend form
    """
    try:
        parameters = ml_service.get_model_parameters(model_id)
        return jsonify(parameters), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@parameters_bp.route('/api/models', methods=['GET'])
def get_models():
    """
    Get list of available models
    """
    try:
        from models.database import db
        
        query = "SELECT model_id, model_name, model_type, description FROM models"
        models = db.execute_query(query)
        
        return jsonify(models), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@parameters_bp.route('/api/datasets', methods=['GET'])
def get_datasets():
    """
    Get list of available datasets
    """
    try:
        from models.database import db
        
        query = """
            SELECT dataset_id, dataset_name, filename, 
                   feature_count, sample_count, description
            FROM datasets
        """
        datasets = db.execute_query(query)
        
        return jsonify(datasets), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500