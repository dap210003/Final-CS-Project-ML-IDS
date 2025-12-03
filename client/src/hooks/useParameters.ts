import { useQuery } from '@tanstack/react-query';
import { parametersApi } from '@/api/parameters';

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: parametersApi.getModels,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useModelParameters = (modelId: number | null) => {
  return useQuery({
    queryKey: ['parameters', modelId],
    queryFn: () => parametersApi.getModelParameters(modelId!),
    enabled: !!modelId, // Only run if modelId exists
  });
};

export const useDatasets = () => {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: parametersApi.getDatasets,
    staleTime: 1000 * 60 * 5,
  });
};