import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useExperiments, useExperimentDetails } from "@/hooks/useExperiments";
import { useResults } from "@/hooks/useResults";
import { ExperimentStatus } from "@/components/experiment/ExperimentStatus";
import { MetricCard } from "@/components/results/MetricCard";
import { ClassWiseResults } from "@/components/results/ClassWiseResults";
import { ConfusionMatrix } from "@/components/results/ConfusionMatrix";
import { LeaderModelsTable } from "@/components/results/LeaderModelsTable";
import { formatDate } from "@/utils/formatters";
import { ArrowLeft, GitCompare } from "lucide-react";

export default function ViewExperiments() {
  const navigate = useNavigate();
  const [selectedExperimentId, setSelectedExperimentId] = useState<number | null>(null);

  // Fetch experiments list
  const { data: experiments, isLoading: experimentsLoading } = useExperiments(20);

  // Fetch selected experiment details
  const { 
    data: experimentDetails, 
    isLoading: detailsLoading 
  } = useExperimentDetails(selectedExperimentId);

  // Fetch results
  const { 
    data: results, 
    isLoading: resultsLoading 
  } = useResults(selectedExperimentId);

  // Auto-select first experiment
  useState(() => {
    if (experiments && experiments.length > 0 && !selectedExperimentId) {
      setSelectedExperimentId(experiments[0].experiment_id);
    }
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              View Experiments
            </h1>
            <p className="text-muted-foreground">
              Review and analyze experiment results
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/compare")}
              variant="outline"
              className="border-border hover:bg-secondary"
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Experiments
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-border hover:bg-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Run
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Experiments List */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                {experimentsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : experiments && experiments.length > 0 ? (
                  <div className="space-y-2">
                    {experiments.map((exp) => (
                      <button
                        key={exp.experiment_id}
                        onClick={() => setSelectedExperimentId(exp.experiment_id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedExperimentId === exp.experiment_id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {exp.experiment_name || `Exp ${exp.experiment_id}`}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              exp.status === 'completed'
                                ? 'bg-green-500/10 text-green-600'
                                : exp.status === 'failed'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }
                          >
                            {exp.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {exp.model_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(exp.start_time)}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No experiments found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Experiment Details */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedExperimentId ? (
              <div className="text-center py-20 text-muted-foreground">
                Select an experiment to view details
              </div>
            ) : detailsLoading || resultsLoading ? (
              <div className="text-center py-20 text-muted-foreground">
                Loading experiment details...
              </div>
            ) : experimentDetails && results ? (
              <>
                {/* Experiment Info Card */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Experiment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                        <p className="text-foreground font-medium">
                          {experimentDetails.experiment_name || `Experiment ${experimentDetails.experiment_id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Model</p>
                        <p className="text-foreground font-medium">
                          {experimentDetails.model_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                        <p className="text-foreground font-medium">
                          {experimentDetails.dataset_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <ExperimentStatus
                          status={experimentDetails.status as any}
                          startTime={experimentDetails.start_time}
                          endTime={experimentDetails.end_time}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                        <p className="text-foreground font-medium">
                          {formatDate(experimentDetails.start_time)}
                        </p>
                      </div>
                      {experimentDetails.end_time && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">End Time</p>
                          <p className="text-foreground font-medium">
                            {formatDate(experimentDetails.end_time)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Metrics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </CardContent>
                </Card>

                {/* Class-wise Results */}
                <ClassWiseResults results={results.class_results} />

                {/* Leader Models (LCCDE only) */}
                {results.leader_models && results.leader_models.length > 0 && (
                  <LeaderModelsTable leaderModels={results.leader_models} />
                )}

                {/* Confusion Matrix */}
                {results.confusion_matrix && (
                  <ConfusionMatrix
                    data={{
                      matrix: results.confusion_matrix,
                      labels: results.class_results.map(r => r.type_name),
                      class_codes: results.class_results.map(r => r.type_code),
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20 text-destructive">
                Failed to load experiment details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}