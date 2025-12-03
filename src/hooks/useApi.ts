import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  datasetsApi, 
  modelsApi, 
  experimentsApi, 
  mlApi, 
  healthApi,
  type Dataset,
  type Model,
  type Experiment,
  type ExperimentDetails,
  type ModelParameter,
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// ====================
// Datasets Hooks
// ====================
export function useDatasets() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: datasetsApi.getAll,
  });
}

export function useCreateDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: datasetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast({ title: 'Dataset created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create dataset', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: datasetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast({ title: 'Dataset deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete dataset', description: error.message, variant: 'destructive' });
    },
  });
}

// ====================
// Models Hooks
// ====================
export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });
}

export function useModelParameters(modelId: number | null) {
  return useQuery({
    queryKey: ['models', modelId, 'parameters'],
    queryFn: () => modelsApi.getParameters(modelId!),
    enabled: !!modelId,
  });
}

export function useUpdateModelParameters() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ modelId, parameters }: { modelId: number; parameters: { param_name: string; param_value: string }[] }) =>
      modelsApi.updateParameters(modelId, parameters),
    onSuccess: (_, { modelId }) => {
      queryClient.invalidateQueries({ queryKey: ['models', modelId, 'parameters'] });
      toast({ title: 'Parameters updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update parameters', description: error.message, variant: 'destructive' });
    },
  });
}

// ====================
// Experiments Hooks
// ====================
export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: experimentsApi.getAll,
  });
}

export function useExperiment(id: number | null) {
  return useQuery({
    queryKey: ['experiments', id],
    queryFn: () => experimentsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: experimentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast({ title: 'Experiment started' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to start experiment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useSaveExperimentResults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, results }: { id: number; results: { accuracy: number; precision: number; recall: number; f1_score: number; runtime?: string } }) =>
      experimentsApi.saveResults(id, results),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['experiments', id] });
      toast({ title: 'Results saved' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to save results', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExperiment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: experimentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast({ title: 'Experiment deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete experiment', description: error.message, variant: 'destructive' });
    },
  });
}

// ====================
// ML Hooks
// ====================
export function useTrainModel() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      experiment_id?: number;
      parameters?: {
        random_seed?: string;
        test_size?: string;
        rf_n_estimators?: string;
        rf_max_depth?: string;
      };
    }) => mlApi.train(params),
    onSuccess: () => {
      toast({ title: 'Training started' });
    },
    onError: (error: Error) => {
      toast({ title: 'Training failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useEvaluateModel() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ configPath, modelPath }: { configPath: string; modelPath: string }) =>
      mlApi.evaluate(configPath, modelPath),
    onSuccess: () => {
      toast({ title: 'Evaluation started' });
    },
    onError: (error: Error) => {
      toast({ title: 'Evaluation failed', description: error.message, variant: 'destructive' });
    },
  });
}

// ====================
// Health Hook
// ====================
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.check,
    refetchInterval: 30000, // Check every 30 seconds
  });
}
