export interface Experiment {
  experiment_id: number;
  experiment_name: string;
  model_id: number;
  dataset_id: number;
  start_time: string;
  end_time?: string;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;
}

export interface CreateExperimentRequest {
  model_id: number;
  dataset_id: number;
  experiment_name?: string;
  parameters: {
    [key: string]: string | number | boolean;
  };
}

export interface ExperimentListResponse {
  experiment_id: number;
  experiment_name: string;
  start_time: string;
  end_time?: string;
  status: string;
  model_name: string;
  dataset_name: string;
  overall_f1_score?: number;
  overall_accuracy?: number;
}

export interface ExperimentDetailResponse {
  experiment_id: number;
  experiment_name: string;
  model_name: string;
  dataset_name: string;
  start_time: string;
  end_time?: string;
  status: string;
  parameters: {
    [key: string]: string;
  };
  overall_accuracy?: number;
  overall_precision?: number;
  overall_recall?: number;
  overall_f1_score?: number;
  training_time?: string;
  prediction_time?: string;
  class_results?: ClassResult[];
  confusion_matrix?: number[][];
}

export interface ClassResult {
  type_name: string;
  type_code: number;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface ComparisonResponse {
  experiment_1: ExperimentDetailResponse;
  experiment_2: ExperimentDetailResponse;
  parameter_differences: {
    [key: string]: {
      experiment_1: string;
      experiment_2: string;
    };
  };
  metric_comparison: {
    accuracy: MetricDiff;
    precision: MetricDiff;
    recall: MetricDiff;
    f1_score: MetricDiff;
  };
  class_comparison: ClassComparison[];
}

export interface MetricDiff {
  experiment_1: number;
  experiment_2: number;
  difference: number;
}

export interface ClassComparison {
  class_name: string;
  experiment_1_f1: number;
  experiment_2_f1: number;
  improvement: number;
}