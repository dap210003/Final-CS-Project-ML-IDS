import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { ROCCurve } from "@/components/ROCCurve";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { useCreateExperiment, useSaveExperimentResults } from "@/hooks/useApi";
import { useLocation } from "react-router-dom";

interface ClonedParams {
  learning_rate?: string;
  batch_size?: string;
  epochs?: string;
  random_seed?: string;
  model?: string;
  dataset?: string;
  sourceExperimentId?: number;
}

export default function RunExperiment() {
  const location = useLocation();
  const clonedParams = location.state as ClonedParams | null;

  const [model, setModel] = useState("LCCDE");
  const [dataset, setDataset] = useState("CICIDS2017");
  const [learningRate, setLearningRate] = useState("0.01");
  const [batchSize, setBatchSize] = useState("64");
  const [epochs, setEpochs] = useState("10");
  const [randomSeed, setRandomSeed] = useState("42");
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentExperimentId, setCurrentExperimentId] = useState<number | null>(null);
  const [sourceExperimentId, setSourceExperimentId] = useState<number | null>(null);
  
  // Load cloned parameters on mount
  useEffect(() => {
    if (clonedParams) {
      if (clonedParams.learning_rate) setLearningRate(clonedParams.learning_rate);
      if (clonedParams.batch_size) setBatchSize(clonedParams.batch_size);
      if (clonedParams.epochs) setEpochs(clonedParams.epochs);
      if (clonedParams.random_seed) setRandomSeed(clonedParams.random_seed);
      if (clonedParams.model) setModel(clonedParams.model);
      if (clonedParams.dataset) setDataset(clonedParams.dataset);
      if (clonedParams.sourceExperimentId) setSourceExperimentId(clonedParams.sourceExperimentId);
      toast.info(`Loaded parameters from Experiment #${clonedParams.sourceExperimentId}`);
    }
  }, []);

  const [results, setResults] = useState({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
  });
  const [runtime, setRuntime] = useState("");

  const createExperiment = useCreateExperiment();
  const saveResults = useSaveExperimentResults();

  const handleRunModel = async () => {
    setIsTraining(true);
    setShowResults(false);
    setProgress(0);
    setStatus("Initializing training...");
    setCurrentExperimentId(null);
    
    try {
      // Create experiment first to get ID
      const experiment = await createExperiment.mutateAsync({
        model_id: 1,
        dataset_id: 1,
        parameters: [
          { param_name: "dataset", param_value: dataset },
          { param_name: "learning_rate", param_value: learningRate },
          { param_name: "batch_size", param_value: batchSize },
          { param_name: "epochs", param_value: epochs },
          { param_name: "random_seed", param_value: randomSeed },
        ],
        notes: `Model: ${model}, Dataset: ${dataset}`,
      });
      
      setCurrentExperimentId(experiment.experiment_id);
      setProgress(10);
      setStatus("Training model with LCCDE pipeline...");
      
      // Call actual backend training endpoint
      const { mlApi } = await import("@/services/api");
      const response = await mlApi.train({
        experiment_id: experiment.experiment_id,
        parameters: {
          random_seed: randomSeed,
          rf_n_estimators: epochs, // Map epochs to n_estimators for RandomForest
        },
      });
      
      setProgress(100);
      setStatus("Training complete");
      
      // Set actual results from training
      setResults({
        accuracy: response.metrics.accuracy,
        precision: response.metrics.precision,
        recall: response.metrics.recall,
        f1_score: response.metrics.f1_score,
      });
      setRuntime(response.runtime);
      
      // Save results to database
      await saveResults.mutateAsync({
        id: experiment.experiment_id,
        results: {
          accuracy: response.metrics.accuracy,
          precision: response.metrics.precision,
          recall: response.metrics.recall,
          f1_score: response.metrics.f1_score,
          runtime: response.runtime,
        },
      });
      
      setIsTraining(false);
      setShowResults(true);
      toast.success("Training completed successfully");
    } catch (error) {
      console.error("Training failed:", error);
      setIsTraining(false);
      setStatus("Training failed");
      toast.error(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveResults = async () => {
    try {
      // First create the experiment
      const experiment = await createExperiment.mutateAsync({
        model_id: 1, // LCCDE model ID
        dataset_id: 1, // CICIDS2017 dataset ID
        parameters: [
          { param_name: "dataset", param_value: dataset },
          { param_name: "learning_rate", param_value: learningRate },
          { param_name: "batch_size", param_value: batchSize },
          { param_name: "epochs", param_value: epochs },
          { param_name: "random_seed", param_value: randomSeed },
        ],
        notes: `Model: ${model}, Dataset: ${dataset}`,
      });

      // Then save the results
      await saveResults.mutateAsync({
        id: experiment.experiment_id,
        results: {
          accuracy: results.accuracy,
          precision: results.precision,
          recall: results.recall,
          f1_score: results.f1_score,
          runtime: "00:04:23",
        },
      });

      setCurrentExperimentId(experiment.experiment_id);
      toast.success(`Experiment #${experiment.experiment_id} saved to database`);
    } catch (error) {
      console.error("Failed to save results:", error);
    }
  };

  const isSaving = createExperiment.isPending || saveResults.isPending;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Run Experiment</h1>
          <p className="text-muted-foreground">Configure and execute ML intrusion detection experiments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parameters Section */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="LCCDE">LCCDE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset</Label>
                  <Select value={dataset} onValueChange={setDataset}>
                    <SelectTrigger id="dataset" className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="CICIDS2017">CICIDS2017</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningRate">Learning rate</Label>
                  <Input
                    id="learningRate"
                    type="number"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="randomSeed">Random seed</Label>
                  <Input
                    id="randomSeed"
                    type="number"
                    value={randomSeed}
                    onChange={(e) => setRandomSeed(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleRunModel}
                  disabled={isTraining}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Run Model
                </Button>
              </CardContent>
            </Card>

            {/* Status Section */}
            {isTraining && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Training</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{status}</p>
                    {progress > 0 && <p>Training... {progress}%</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {showResults ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard label="Accuracy" value={results.accuracy.toFixed(3)} />
                      <MetricCard label="Precision" value={results.precision.toFixed(3)} />
                      <MetricCard label="Recall" value={results.recall.toFixed(3)} />
                      <MetricCard label="F1 Score" value={results.f1_score.toFixed(3)} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">ROC Curve</h3>
                      <ROCCurve />
                    </div>

                    {runtime && (
                      <p className="text-sm text-muted-foreground text-center">
                        Runtime: {runtime}
                      </p>
                    )}
                    
                    <div className="text-center text-sm text-muted-foreground">
                      {currentExperimentId && `Saved as Experiment #${currentExperimentId}`}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Run an experiment to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-success"></div>
          <span className="text-muted-foreground">Connection: PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
