import os

class Config:
    """Application configuration"""
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'ids_ml')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    
    # Database connection string
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Data paths
    DATA_PATH = './data'
    MODEL_SAVE_PATH = './saved_models'
    
    # ML configuration
    DEFAULT_RANDOM_STATE = 0
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        os.makedirs(Config.DATA_PATH, exist_ok=True)
        os.makedirs(Config.MODEL_SAVE_PATH, exist_ok=True)