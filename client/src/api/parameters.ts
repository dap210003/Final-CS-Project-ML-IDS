import apiClient from './client';
import { Model, Dataset, Parameter } from '@/types/parameter';

export const parametersApi = {
  // Get all available models
  getModels: async (): Promise<Model[]> => {
    const response = await apiClient.get('/models');
    return response.data;
  },

  // Get editable parameters for specific model
  getModelParameters: async (modelId: number): Promise<Parameter[]> => {
    const response = await apiClient.get(`/models/${modelId}/parameters`);
    return response.data;
  },

  // Get all available datasets
  getDatasets: async (): Promise<Dataset[]> => {
    const response = await apiClient.get('/datasets');
    return response.data;
  },
};