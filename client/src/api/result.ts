import apiClient from './client';
import { 
  ExperimentResults, 
  ConfusionMatrixData,
  LeaderModel,
  MetricComparison 
} from '@/types/result';

export const resultsApi = {
  // Get complete results for an experiment
  getResults: async (experimentId: number): Promise<ExperimentResults> => {
    const response = await apiClient.get(`/results/${experimentId}`);
    return response.data;
  },

  // Get confusion matrix data
  getConfusionMatrix: async (experimentId: number): Promise<ConfusionMatrixData> => {
    const response = await apiClient.get(`/results/confusion-matrix/${experimentId}`);
    return response.data;
  },

  // Get leader models (LCCDE specific)
  getLeaderModels: async (experimentId: number): Promise<LeaderModel[]> => {
    const response = await apiClient.get(`/results/leader-models/${experimentId}`);
    return response.data;
  },

  // Compare metrics between two experiments
  compareMetrics: async (
    experimentId1: number, 
    experimentId2: number
  ): Promise<MetricComparison> => {
    const response = await apiClient.post('/results/compare-metrics', {
      experiment_id_1: experimentId1,
      experiment_id_2: experimentId2,
    });
    return response.data;
  },

  // Export results
  exportResults: async (experimentId: number): Promise<any> => {
    const response = await apiClient.get(`/results/export/${experimentId}`);
    return response.data;
  },
};