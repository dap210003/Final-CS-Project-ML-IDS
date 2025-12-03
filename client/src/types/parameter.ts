export interface Model {
  model_id: number;
  model_name: string;
  model_type: string;
  description: string;
}

export interface Dataset {
  dataset_id: number;
  dataset_name: string;
  filename: string;
  feature_count: number;
  sample_count: number;
  description: string;
}

export interface Parameter {
  param_id?: number;
  param_name: string;
  default_value: string;
  param_type: string;
  min_value?: number;
  max_value?: number;
  editable: boolean;
  category: string;
  description: string;
}

export interface ParameterValues {
  [key: string]: string | number | boolean;
}