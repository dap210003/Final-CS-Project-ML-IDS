import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '@/api/results';

export const useResults = (experimentId: number | null) => {
  return useQuery({
    queryKey: ['results', experimentId],
    queryFn: () => resultsApi.getResults(experimentId!),
    enabled: !!experimentId,
  });
};

export const useConfusionMatrix = (experimentId: number | null) => {
  return useQuery({
    queryKey: ['confusion-matrix', experimentId],
    queryFn: () => resultsApi.getConfusionMatrix(experimentId!),
    enabled: !!experimentId,
  });
};

export const useLeaderModels = (experimentId: number | null) => {
  return useQuery({
    queryKey: ['leader-models', experimentId],
    queryFn: () => resultsApi.getLeaderModels(experimentId!),
    enabled: !!experimentId,
  });
};

export const useMetricComparison = (
  experimentId1: number | null,
  experimentId2: number | null
) => {
  return useQuery({
    queryKey: ['metric-comparison', experimentId1, experimentId2],
    queryFn: () => resultsApi.compareMetrics(experimentId1!, experimentId2!),
    enabled: !!experimentId1 && !!experimentId2,
  });
};