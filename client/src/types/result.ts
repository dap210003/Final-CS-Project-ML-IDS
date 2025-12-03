export interface ExperimentResults {
  overall_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    training_time: string;
    prediction_time: string;
  };
  class_results: ClassResultDetail[];
  confusion_matrix: number[][];
  leader_models: LeaderModel[];
  timestamp: string;
}

export interface ClassResultDetail {
  type_name: string;
  type_code: number;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface LeaderModel {
  type_name: string;
  type_code: number;
  base_model_name: string;
  f1_score: number;
}

export interface ConfusionMatrixData {
  matrix: number[][];
  labels: string[];
  class_codes: number[];
}

export interface MetricComparison {
  overall_comparison: {
    experiment_1: ExperimentMetrics;
    experiment_2: ExperimentMetrics;
  };
  class_comparison: {
    [className: string]: {
      type_code: number;
      experiment_1: number;
      experiment_2: number;
      difference: number;
      improvement_percent: number;
    };
  };
}

export interface ExperimentMetrics {
  id: number;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}