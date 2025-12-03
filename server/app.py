from flask import Flask
from flask_cors import CORS
from config import Config
from models.database import db
from routes.experiments import experiments_bp
from routes.parameters import parameters_bp
from routes.results import results_bp  # Add this import

def create_app():
    """Create and configure Flask application"""
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for frontend
    CORS(app)
    
    # Initialize configuration
    Config.init_app(app)
    
    # Connect to database
    @app.before_request
    def before_request():
        if not db.conn or db.conn.closed:
            db.connect()
    
    @app.teardown_request
    def teardown_request(exception=None):
        # Connection will be reused, so we don't close it here
        pass
    
    # Register blueprints
    app.register_blueprint(experiments_bp)
    app.register_blueprint(parameters_bp)
    app.register_blueprint(results_bp)  # Add this line
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'database': 'connected'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("Starting IDS-ML Flask Server...")
    print("API endpoints available:")
    print("\n--- Experiments ---")
    print("  POST   /api/experiments              - Create experiment")
    print("  GET    /api/experiments              - List experiments")
    print("  GET    /api/experiments/<id>         - Get experiment details")
    print("  POST   /api/experiments/compare      - Compare experiments")
    print("\n--- Parameters & Models ---")
    print("  GET    /api/models                   - List models")
    print("  GET    /api/models/<id>/parameters   - Get model parameters")
    print("  GET    /api/datasets                 - List datasets")
    print("\n--- Results ---")
    print("  GET    /api/results/<id>             - Get experiment results")
    print("  GET    /api/results/class/<id>/<code>- Get class-specific results")
    print("  GET    /api/results/confusion-matrix/<id> - Get confusion matrix")
    print("  GET    /api/results/leader-models/<id>    - Get leader models (LCCDE)")
    print("  POST   /api/results/compare-metrics  - Compare metrics visualization")
    print("  GET    /api/results/export/<id>      - Export complete results")
    
    app.run(host='0.0.0.0', port=5000, debug=True)