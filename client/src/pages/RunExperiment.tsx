import { useState } from "react";
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

export default function RunExperiment() {
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

  const handleRunModel = async () => {
    setIsTraining(true);
    setShowResults(false);
    setProgress(0);
    setStatus("Preprocessing...");
    
    toast.success("Parameters validated successfully");

    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus("Preprocessing... done");
    
    setStatus("Training...");
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setStatus("Training complete");
    setIsTraining(false);
    setShowResults(true);
    toast.success("Training completed successfully");
  };

  const handleSaveResults = () => {
    toast.success("Results saved to database");
  };

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
                      <SelectItem value="CNN">CNN</SelectItem>
                      <SelectItem value="LSTM">LSTM</SelectItem>
                      <SelectItem value="RandomForest">Random Forest</SelectItem>
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
                      <SelectItem value="NSL-KDD">NSL-KDD</SelectItem>
                      <SelectItem value="UNSW-NB15">UNSW-NB15</SelectItem>
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
                      <MetricCard label="Accuracy" value="0.947" />
                      <MetricCard label="Precision" value="0.932" />
                      <MetricCard label="Recall" value="0.923" />
                      <MetricCard label="F1 Score" value="0.928" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">ROC Curve</h3>
                      <ROCCurve />
                    </div>

                    <Button
                      onClick={handleSaveResults}
                      variant="outline"
                      className="w-full border-border hover:bg-secondary"
                    >
                      Save Results to Database
                    </Button>
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
