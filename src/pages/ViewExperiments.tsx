import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { ROCCurve } from "@/components/ROCCurve";
import { ArrowLeft, Loader2, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExperiments, useExperiment } from "@/hooks/useApi";
import { toast } from "sonner";

// Helper to clean up dataset filename for display
const formatDatasetName = (name: string | undefined): string => {
  if (!name) return "CICIDS2017";
  // Remove extension and clean up the name
  return name
    .replace(/\.csv$/i, "")
    .replace(/_sample$/i, "")
    .replace(/_/g, " ")
    .toUpperCase();
};

export default function ViewExperiments() {
  const navigate = useNavigate();
  const [selectedExperimentId, setSelectedExperimentId] = useState<number | null>(null);

  const { data: experiments, isLoading: experimentsLoading } = useExperiments();
  const { data: experimentDetails, isLoading: detailsLoading } = useExperiment(selectedExperimentId);

  const handleExperimentChange = (value: string) => {
    setSelectedExperimentId(Number(value));
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
            <Select 
              value={selectedExperimentId?.toString() || ""} 
              onValueChange={handleExperimentChange}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select experiment" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {experimentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : experiments && experiments.length > 0 ? (
                  experiments.map((exp) => (
                    <SelectItem key={exp.experiment_id} value={exp.experiment_id.toString()}>
                      Exp #{exp.experiment_id} - {exp.model_name || "LCCDE"}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No experiments found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedExperimentId ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              Select an experiment from the dropdown to view details
            </CardContent>
          </Card>
        ) : detailsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : experimentDetails ? (
          <>
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
                      <p className="text-foreground font-medium">
                        {new Date(experimentDetails.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Model</p>
                      <p className="text-foreground font-medium">
                        {experimentDetails.model_name || "LCCDE"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                      <p className="text-foreground font-medium">
                        {experimentDetails.parameters?.find(p => p.param_name === 'dataset')?.param_value || formatDatasetName(experimentDetails.dataset_name)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="text-foreground font-medium capitalize">
                        {experimentDetails.status}
                      </p>
                    </div>
                    {experimentDetails.parameters?.filter(param => param.param_name !== 'dataset').map((param) => (
                      <div key={param.param_name}>
                        <p className="text-sm text-muted-foreground mb-1">{param.param_name}</p>
                        <p className="text-foreground font-medium">{param.param_value}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      const params: Record<string, string> = {};
                      experimentDetails.parameters?.forEach((p) => {
                        params[p.param_name] = p.param_value;
                      });
                      const datasetParam = experimentDetails.parameters?.find(p => p.param_name === 'dataset')?.param_value;
                      navigate("/", {
                        state: {
                          ...params,
                          model: experimentDetails.model_name || "LCCDE",
                          dataset: datasetParam || formatDatasetName(experimentDetails.dataset_name),
                          sourceExperimentId: experimentDetails.experiment_id,
                        },
                      });
                      toast.success("Parameters loaded - modify and run a new experiment");
                    }}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Clone & Modify Parameters
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experimentDetails.results ? (
                    <div className="grid grid-cols-3 gap-4">
                      <MetricCard 
                        label="Accuracy" 
                        value={experimentDetails.results.accuracy != null 
                          ? Number(experimentDetails.results.accuracy).toFixed(3) 
                          : "N/A"} 
                      />
                      <MetricCard 
                        label="Precision" 
                        value={experimentDetails.results.precision != null 
                          ? Number(experimentDetails.results.precision).toFixed(3) 
                          : "N/A"} 
                      />
                      <MetricCard 
                        label="F1 Score" 
                        value={experimentDetails.results.f1_score != null 
                          ? Number(experimentDetails.results.f1_score).toFixed(3) 
                          : "N/A"} 
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No results available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ROC Curve */}
            {experimentDetails.results && (
              <Card className="bg-card border-border mt-8">
                <CardHeader>
                  <CardTitle>ROC Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ROCCurve />
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              Experiment not found
            </CardContent>
          </Card>
        )}

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
