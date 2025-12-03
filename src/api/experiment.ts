import apiClient from './client';
import { 
  Experiment, 
  CreateExperimentRequest, 
  ExperimentListResponse,
  ExperimentDetailResponse,
  ComparisonResponse 
} from '@/types/experiment';

export const experimentsApi = {
  // Get list of recent experiments
  getExperiments: async (limit: number = 10): Promise<ExperimentListResponse[]> => {
    const response = await apiClient.get(`/experiments?limit=${limit}`);
    return response.data;
  },

  // Create and run new experiment
  createExperiment: async (data: CreateExperimentRequest): Promise<Experiment> => {
    const response = await apiClient.post('/experiments', data);
    return response.data;
  },

  // Get detailed information about specific experiment
  getExperimentDetails: async (experimentId: number): Promise<ExperimentDetailResponse> => {
    const response = await apiClient.get(`/experiments/${experimentId}`);
    return response.data;
  },

  // Compare two experiments
  compareExperiments: async (
    experimentId1: number, 
    experimentId2: number
  ): Promise<ComparisonResponse> => {
    const response = await apiClient.post('/experiments/compare', {
      experiment_id_1: experimentId1,
      experiment_id_2: experimentId2,
    });
    return response.data;
  },
};