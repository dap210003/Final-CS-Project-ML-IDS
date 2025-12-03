import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, classification_report, confusion_matrix
)
from imblearn.over_sampling import SMOTE
import lightgbm as lgb
import xgboost as xgb
import catboost as cbt
from river import stream
from statistics import mode
import time

class LCCDEService:
    """
    Leader Class and Confidence Decision Ensemble Service
    Reuses core logic from LCCDE Jupyter Notebook
    """
    
    def __init__(self):
        self.models = {}
        self.leader_models = []
        
    def load_and_prepare_data(self, dataset_path, train_size=0.8, random_state=0):
        """
        Load dataset and split into train/test sets
        Reused from Jupyter Notebook
        
        Args:
            dataset_path: Path to CSV file
            train_size: Training set ratio
            random_state: Random seed
            
        Returns:
            X_train, X_test, y_train, y_test
        """
        # Read dataset
        df = pd.read_csv(dataset_path)
        
        # Split features and labels
        X = df.drop(['Label'], axis=1)
        y = df['Label']
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            train_size=train_size, 
            test_size=1-train_size, 
            random_state=random_state
        )
        
        return X_train, X_test, y_train, y_test
        
    def apply_smote(self, X_train, y_train, sampling_strategy=None):
        """
        Apply SMOTE oversampling
        Reused from Jupyter Notebook
        
        Args:
            X_train: Training features
            y_train: Training labels
            sampling_strategy: SMOTE sampling strategy dict
            
        Returns:
            Resampled X_train, y_train
        """
        if sampling_strategy is None:
            sampling_strategy = {2: 1000, 4: 1000}
            
        smote = SMOTE(n_jobs=-1, sampling_strategy=sampling_strategy)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
        
        return X_train_resampled, y_train_resampled
        
    def train_base_models(self, X_train, y_train):
        """
        Train three base models: LightGBM, XGBoost, CatBoost
        Reused from Jupyter Notebook
        
        Args:
            X_train: Training features
            y_train: Training labels
            
        Returns:
            Dictionary of trained models
        """
        print("Training base models...")
        
        # Train LightGBM
        print("Training LightGBM...")
        lg_model = lgb.LGBMClassifier()
        lg_model.fit(X_train, y_train)
        
        # Train XGBoost
        print("Training XGBoost...")
        xg_model = xgb.XGBClassifier()
        X_train_xgb = X_train.values if isinstance(X_train, pd.DataFrame) else X_train
        xg_model.fit(X_train_xgb, y_train)
        
        # Train CatBoost
        print("Training CatBoost...")
        cb_model = cbt.CatBoostClassifier(verbose=0, boosting_type='Plain')
        cb_model.fit(X_train, y_train)
        
        self.models = {
            'LightGBM': lg_model,
            'XGBoost': xg_model,
            'CatBoost': cb_model
        }
        
        return self.models
        
    def evaluate_base_models(self, X_test, y_test):
        """
        Evaluate each base model and get F1-scores for each class
        Reused from Jupyter Notebook
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Dictionary of F1-scores for each model and class
        """
        results = {}
        
        for model_name, model in self.models.items():
            # Prepare test data
            if model_name == 'XGBoost':
                X_test_model = X_test.values if isinstance(X_test, pd.DataFrame) else X_test
            else:
                X_test_model = X_test
                
            # Predict
            y_pred = model.predict(X_test_model)
            
            # Calculate F1-scores for each class
            f1_per_class = f1_score(y_test, y_pred, average=None)
            
            results[model_name] = {
                'f1_per_class': f1_per_class,
                'overall_f1': f1_score(y_test, y_pred, average='weighted'),
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted')
            }
            
        return results
        
    def find_leader_models(self, evaluation_results):
        """
        Find the best-performing (leader) model for each class
        Reused from Jupyter Notebook Algorithm 1
        
        Args:
            evaluation_results: Results from evaluate_base_models()
            
        Returns:
            List of leader models for each class
        """
        # Get number of classes from first model's results
        first_model = list(evaluation_results.keys())[0]
        num_classes = len(evaluation_results[first_model]['f1_per_class'])
        
        leader_models = []
        
        # For each class, find the best-performing model
        for class_idx in range(num_classes):
            best_model = None
            best_f1 = -1
            
            for model_name, results in evaluation_results.items():
                class_f1 = results['f1_per_class'][class_idx]
                
                if class_f1 > best_f1:
                    best_f1 = class_f1
                    best_model = self.models[model_name]
                    
            leader_models.append(best_model)
            
        self.leader_models = leader_models
        return leader_models
        
    def lccde_predict(self, X_test, y_test):
        """
        LCCDE prediction algorithm
        Reused from Jupyter Notebook Algorithm 2
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            y_true, y_pred lists
        """
        m1 = self.models['LightGBM']
        m2 = self.models['XGBoost']
        m3 = self.models['CatBoost']
        
        y_true = []
        y_pred = []
        
        # Iterate through test samples
        for xi, yi in stream.iter_pandas(X_test, y_test):
            xi_array = np.array(list(xi.values())).reshape(1, -1)
            
            # Get predictions from all three models
            y_pred1 = int(m1.predict(xi_array)[0])
            y_pred2 = int(m2.predict(xi_array)[0])
            y_pred3 = int(m3.predict(xi_array)[0])
            
            # Get prediction probabilities (confidence)
            p1 = np.max(m1.predict_proba(xi_array))
            p2 = np.max(m2.predict_proba(xi_array))
            p3 = np.max(m3.predict_proba(xi_array))
            
            # Decision logic
            if y_pred1 == y_pred2 == y_pred3:
                # All three models agree
                final_pred = y_pred1
                
            elif y_pred1 != y_pred2 != y_pred3:
                # All three models disagree
                leader_list = []
                pred_list = []
                prob_list = []
                
                # Check if predicted class matches its leader model
                if self.leader_models[y_pred1] == m1:
                    leader_list.append(m1)
                    pred_list.append(y_pred1)
                    prob_list.append(p1)
                    
                if self.leader_models[y_pred2] == m2:
                    leader_list.append(m2)
                    pred_list.append(y_pred2)
                    prob_list.append(p2)
                    
                if self.leader_models[y_pred3] == m3:
                    leader_list.append(m3)
                    pred_list.append(y_pred3)
                    prob_list.append(p3)
                    
                if len(prob_list) == 0:
                    prob_list = [p1, p2, p3]
                    
                if len(leader_list) == 1:
                    final_pred = pred_list[0]
                else:
                    # Use highest confidence
                    max_prob = max(prob_list)
                    if max_prob == p1:
                        final_pred = y_pred1
                    elif max_prob == p2:
                        final_pred = y_pred2
                    else:
                        final_pred = y_pred3
                        
            else:
                # Two models agree, one disagrees
                majority_class = mode([y_pred1, y_pred2, y_pred3])
                final_pred = int(self.leader_models[majority_class].predict(xi_array)[0])
                
            y_true.append(yi)
            y_pred.append(final_pred)
            
        return y_true, y_pred
        
    def calculate_metrics(self, y_true, y_pred):
        """
        Calculate all performance metrics
        Reused from Jupyter Notebook
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            
        Returns:
            Dictionary of metrics
        """
        return {
            'overall_accuracy': float(accuracy_score(y_true, y_pred)),
            'overall_precision': float(precision_score(y_true, y_pred, average='weighted')),
            'overall_recall': float(recall_score(y_true, y_pred, average='weighted')),
            'overall_f1_score': float(f1_score(y_true, y_pred, average='weighted')),
            'f1_per_class': f1_score(y_true, y_pred, average=None).tolist(),
            'confusion_matrix': confusion_matrix(y_true, y_pred).tolist(),
            'classification_report': classification_report(y_true, y_pred, output_dict=True)
        }