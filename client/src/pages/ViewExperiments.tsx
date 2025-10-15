import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { ROCCurve } from "@/components/ROCCurve";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ViewExperiments() {
  const navigate = useNavigate();
  const [selectedExperiment, setSelectedExperiment] = useState("exp_001");

  const experiments = [
    { id: "exp_001", date: "April 24, 2024", model: "LCCDE" },
    { id: "exp_002", date: "April 23, 2024", model: "CNN" },
    { id: "exp_003", date: "April 22, 2024", model: "LSTM" },
  ];

  const experimentDetails = {
    date: "April 24, 2024",
    model: "LCCDE",
    dataset: "CICIDS2017",
    learningRate: "0.01",
    batchSize: "32",
    randomSeed: "42",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">View Experiment</h1>
            <p className="text-muted-foreground">Review and analyze experiment results</p>
          </div>
          <div className="w-64">
            <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select experiment" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {experiments.map((exp) => (
                  <SelectItem key={exp.id} value={exp.id}>
                    {exp.id} - {exp.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experiment Details Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Experiment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="text-foreground font-medium">{experimentDetails.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Model</p>
                  <p className="text-foreground font-medium">{experimentDetails.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                  <p className="text-foreground font-medium">{experimentDetails.dataset}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Learning rate</p>
                  <p className="text-foreground font-medium">{experimentDetails.learningRate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Batch size</p>
                  <p className="text-foreground font-medium">{experimentDetails.batchSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Random seed</p>
                  <p className="text-foreground font-medium">{experimentDetails.randomSeed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Accuracy" value="0.952" />
                <MetricCard label="Precision" value="0.933" />
                <MetricCard label="F1 Score" value="0.921" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROC Curve */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle>ROC Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <ROCCurve />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiments
          </Button>
        </div>
      </div>
    </div>
  );
}
