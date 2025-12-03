// API Service Layer for LCCDE Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ====================
// Types
// ====================
export interface Dataset {
  dataset_id: number;
  filename: string;
  source: string | null;
  upload_date: string;
  feature_count: number;
  label_count: number;
}

export interface Model {
  model_id: number;
  model_name: string;
  description: string | null;
}

export interface ModelParameter {
  param_id: number;
  model_id: number;
  param_name: string;
  param_value: string;
  param_type: string;
  editable: boolean;
  description: string | null;
}

export interface Experiment {
  experiment_id: number;
  model_id: number;
  dataset_id: number;
  model_name?: string;
  dataset_name?: string;
  start_time: string;
  end_time: string | null;
  status: 'running' | 'completed' | 'failed';
  notes: string | null;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  runtime?: string;
}

export interface ExperimentParameter {
  experiment_id: number;
  param_name: string;
  param_value: string;
}

export interface ExperimentResult {
  result_id: number;
  experiment_id: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  runtime: string;
  timestamp: string;
}

export interface ExperimentDetails extends Experiment {
  parameters: ExperimentParameter[];
  results: ExperimentResult | null;
}

// ====================
// Datasets API
// ====================
export const datasetsApi = {
  getAll: () => fetchApi<Dataset[]>('/datasets'),
  
  create: (data: Omit<Dataset, 'dataset_id' | 'upload_date'>) =>
    fetchApi<Dataset>('/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/datasets/${id}`, {
      method: 'DELETE',
    }),
};

// ====================
// Models API
// ====================
export const modelsApi = {
  getAll: () => fetchApi<Model[]>('/models'),
  
  getParameters: (modelId: number) =>
    fetchApi<ModelParameter[]>(`/models/${modelId}/parameters`),
  
  updateParameters: (modelId: number, parameters: { param_name: string; param_value: string }[]) =>
    fetchApi<{ message: string }>(`/models/${modelId}/parameters`, {
      method: 'PUT',
      body: JSON.stringify({ parameters }),
    }),
};

// ====================
// Experiments API
// ====================
export const experimentsApi = {
  getAll: () => fetchApi<Experiment[]>('/experiments'),
  
  getById: (id: number) => fetchApi<ExperimentDetails>(`/experiments/${id}`),
  
  create: (data: {
    model_id: number;
    dataset_id: number;
    parameters?: { param_name: string; param_value: string }[];
    notes?: string;
  }) =>
    fetchApi<Experiment>('/experiments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  saveResults: (id: number, results: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    runtime?: string;
  }) =>
    fetchApi<ExperimentResult>(`/experiments/${id}/results`, {
      method: 'PUT',
      body: JSON.stringify(results),
    }),
  
  delete: (id: number) =>
    fetchApi<{ message: string }>(`/experiments/${id}`, {
      method: 'DELETE',
    }),
};

// ====================
// ML API
// ====================
export interface TrainResponse {
  message: string;
  output: string;
  model_path: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  runtime: string;
}

export const mlApi = {
  train: (params: {
    experiment_id?: number;
    parameters?: {
      random_seed?: string;
      test_size?: string;
      rf_n_estimators?: string;
      rf_max_depth?: string;
    };
  }) =>
    fetchApi<TrainResponse>('/ml/train', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  
  evaluate: (configPath: string, modelPath: string) =>
    fetchApi<{ message: string; note: string }>('/ml/evaluate', {
      method: 'POST',
      body: JSON.stringify({ config_path: configPath, model_path: modelPath }),
    }),
};

// ====================
// Health Check
// ====================
export const healthApi = {
  check: () => fetchApi<{ status: string; timestamp: string }>('/health'),
};
