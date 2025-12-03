import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { experimentsApi } from '@/api/experiments';
import { CreateExperimentRequest } from '@/types/experiment';
import { toast } from 'sonner';

export const useExperiments = (limit: number = 10) => {
  return useQuery({
    queryKey: ['experiments', limit],
    queryFn: () => experimentsApi.getExperiments(limit),
  });
};

export const useExperimentDetails = (experimentId: number | null) => {
  return useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: () => experimentsApi.getExperimentDetails(experimentId!),
    enabled: !!experimentId,
  });
};

export const useCreateExperiment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExperimentRequest) => 
      experimentsApi.createExperiment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast.success('Experiment completed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Experiment failed');
    },
  });
};

export const useCompareExperiments = (
  experimentId1: number | null,
  experimentId2: number | null
) => {
  return useQuery({
    queryKey: ['compare', experimentId1, experimentId2],
    queryFn: () => 
      experimentsApi.compareExperiments(experimentId1!, experimentId2!),
    enabled: !!experimentId1 && !!experimentId2,
  });
};