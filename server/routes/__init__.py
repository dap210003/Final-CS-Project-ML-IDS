# routes/__init__.py
from .experiments import experiments_bp
from .parameters import parameters_bp
from .results import results_bp

__all__ = ['experiments_bp', 'parameters_bp', 'results_bp']