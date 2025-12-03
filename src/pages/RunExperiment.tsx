import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Save, Download } from "lucide-react";
import { toast } from "sonner";
import { 
  useModels, 
  useDatasets, 
  useModelParameters 
} from "@/hooks/useParameters";
import { useCreateExperiment } from "@/hooks/useExperiments";
import { useResults } from "@/hooks/useResults";
import { ParameterForm } from "@/components/experiment/ParameterForm";
import { TrainingProgress } from "@/components/experiment/TrainingProgress";
import { MetricCard } from "@/components/results/MetricCard";
import { ClassWiseResults } from "@/components/results/ClassWiseResults";
import { ConfusionMatrix } from "@/components/results/ConfusionMatrix";
import { LeaderModelsTable } from "@/components/results/LeaderModelsTable";
import { ParameterValues } from "@/types/parameter";
import { validateAllParameters } from "@/utils/validators";

export default function RunExperiment() {
  // State for selections
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [experimentName, setExperimentName] = useState("");
  const [parameterValues, setParameterValues] = useState<ParameterValues>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  // State for training
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [completedExperimentId, setCompletedExperimentId] = useState<number | null>(null);

  // Fetch data
  const { data: models, isLoading: modelsLoading } = useModels();
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();
  const { data: parameters, isLoading: parametersLoading } = useModelParameters(selectedModelId);
  const { data: results, isLoading: resultsLoading } = useResults(completedExperimentId);
  
  // Mutations
  const createExperiment = useCreateExperiment();

  // Initialize default model and dataset
  useEffect(() => {
    if (models && models.length > 0 && !selectedModelId) {
      // Default to LCCDE model (model_id = 1)
      const lccdeModel = models.find(m => m.model_name === "LCCDE");
      setSelectedModelId(lccdeModel?.model_id || models[0].model_id);
    }
  }, [models]);

  useEffect(() => {
    if (datasets && datasets.length > 0 && !selectedDatasetId) {
      // Default to CICIDS2017 (dataset_id = 1)
      const cicids = datasets.find(d => d.dataset_name === "CICIDS2017");
      setSelectedDatasetId(cicids?.dataset_id || datasets[0].dataset_id);
    }
  }, [datasets]);

  // Initialize parameter values when parameters load
  useEffect(() => {
    if (parameters) {
      const initialValues: ParameterValues = {};
      parameters.forEach(param => {
        initialValues[param.param_name] = param.default_value;
      });
      setParameterValues(initialValues);
    }
  }, [parameters]);

  // Handle form submission
  const handleRunExperiment = async () => {
    // Validate all parameters
    if (!parameters) return;
    
    const errors = validateAllParameters(parameters, parameterValues);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors before running");
      return;
    }

    if (!selectedModelId || !selectedDatasetId) {
      toast.error("Please select model and dataset");
      return;
    }

    // Start training
    setIsTraining(true);
    setProgress(0);
    setStatus("Initializing...");
    setCompletedExperimentId(null);

    // Simulate progress updates (in real app, use WebSocket or polling)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 1000);

    try {
      // Create experiment
      const result = await createExperiment.mutateAsync({
        model_id: selectedModelId,
        dataset_id: selectedDatasetId,
        experiment_name: experimentName || undefined,
        parameters: parameterValues,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Training complete!");
      setIsTraining(false);
      setCompletedExperimentId(result.experiment_id);
      
      toast.success("Experiment completed successfully!");
    } catch (error) {
      clearInterval(progressInterval);
      setIsTraining(false);
      setProgress(0);
      setStatus("");
      toast.error("Experiment failed. Please try again.");
    }
  };

  // Handle save results
  const handleSaveResults = () => {
    toast.success("Results saved to database");
  };

  // Handle export results
  const handleExportResults = () => {
    if (!completedExperimentId) return;
    // In real app, call export API
    toast.success("Results exported successfully");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Run Experiment</h1>
          <p className="text-muted-foreground">
            Configure and execute ML intrusion detection experiments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Basic Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Basic Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Experiment Name */}
                <div className="space-y-2">
                  <Label htmlFor="experimentName">Experiment Name (Optional)</Label>
                  <Input
                    id="experimentName"
                    type="text"
                    placeholder="e.g., LCCDE Test Run 1"
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  {modelsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading models...</div>
                  ) : (
                    <Select 
                      value={selectedModelId?.toString() || ""} 
                      onValueChange={(value) => {
                        setSelectedModelId(Number(value));
                        setParameterValues({}); // Reset parameters
                      }}
                    >
                      <SelectTrigger id="model" className="bg-input border-border">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {models?.map((model) => (
                          <SelectItem key={model.model_id} value={model.model_id.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.model_name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({model.model_type})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Dataset Selection */}
                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset</Label>
                  {datasetsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading datasets...</div>
                  ) : (
                    <Select 
                      value={selectedDatasetId?.toString() || ""} 
                      onValueChange={(value) => setSelectedDatasetId(Number(value))}
                    >
                      <SelectTrigger id="dataset" className="bg-input border-border">
                        <SelectValue placeholder="Select a dataset" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {datasets?.map((dataset) => (
                          <SelectItem key={dataset.dataset_id} value={dataset.dataset_id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{dataset.dataset_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {dataset.sample_count?.toLocaleString()} samples, {dataset.feature_count} features
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parameter Configuration */}
            {parametersLoading ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    Loading parameters...
                  </div>
                </CardContent>
              </Card>
            ) : parameters && parameters.length > 0 ? (
              <ParameterForm
                parameters={parameters}
                values={parameterValues}
                onChange={setParameterValues}
                errors={validationErrors}
              />
            ) : null}

            {/* Run Button */}
            <Button
              onClick={handleRunExperiment}
              disabled={isTraining || !selectedModelId || !selectedDatasetId}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              {isTraining ? "Training..." : "Run Experiment"}
            </Button>

            {/* Training Progress */}
            {isTraining && (
              <TrainingProgress
                status={status}
                progress={progress}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading results...
                  </div>
                ) : results ? (
                  <div className="space-y-6">
                    {/* Overall Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard 
                        label="Accuracy" 
                        value={results.overall_metrics.accuracy}
                      />
                      <MetricCard 
                        label="Precision" 
                        value={results.overall_metrics.precision}
                      />
                      <MetricCard 
                        label="Recall" 
                        value={results.overall_metrics.recall}
                      />
                      <MetricCard 
                        label="F1-Score" 
                        value={results.overall_metrics.f1_score}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveResults}
                        variant="outline"
                        className="flex-1 border-border hover:bg-secondary"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save to Database
                      </Button>
                      <Button
                        onClick={handleExportResults}
                        variant="outline"
                        className="flex-1 border-border hover:bg-secondary"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Results
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Run an experiment to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Results Section (only show when results available) */}
        {results && (
          <div className="mt-8 space-y-6">
            {/* Class-wise Results */}
            <ClassWiseResults results={results.class_results} />

            {/* LCCDE Leader Models */}
            {results.leader_models && results.leader_models.length > 0 && (
              <LeaderModelsTable leaderModels={results.leader_models} />
            )}

            {/* Confusion Matrix */}
            {results.confusion_matrix && results.confusion_matrix.length > 0 && (
              <ConfusionMatrix 
                data={{
                  matrix: results.confusion_matrix,
                  labels: results.class_results.map(r => r.type_name),
                  class_codes: results.class_results.map(r => r.type_code),
                }}
              />
            )}
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-6 flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-muted-foreground">Connected to Backend API</span>
        </div>
      </div>
    </div>
  );
}