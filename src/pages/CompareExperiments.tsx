import { useState } from "react";
// Compare experiments page
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { useExperiments, useExperiment } from "@/hooks/useApi";

export default function CompareExperiments() {
  const [leftExperimentId, setLeftExperimentId] = useState<number | null>(null);
  const [rightExperimentId, setRightExperimentId] = useState<number | null>(null);

  const { data: experiments, isLoading: experimentsLoading } = useExperiments();
  const { data: leftExperiment, isLoading: leftLoading } = useExperiment(leftExperimentId);
  const { data: rightExperiment, isLoading: rightLoading } = useExperiment(rightExperimentId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMetricDiff = (left: number | null | undefined, right: number | null | undefined) => {
    if (left == null || right == null) return null;
    const diff = right - left;
    return diff;
  };

  const renderMetricComparison = (label: string, leftVal: number | null | undefined, rightVal: number | null | undefined) => {
    const diff = getMetricDiff(leftVal, rightVal);
    const diffClass = diff != null ? (diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground") : "";
    const diffText = diff != null ? (diff > 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)) : "";

    return (
      <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border last:border-0">
        <div className="text-center">
          <span className="text-lg font-semibold text-foreground">
            {leftVal != null ? Number(leftVal).toFixed(3) : "N/A"}
          </span>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          {diff != null && <p className={`text-xs ${diffClass}`}>{diffText}</p>}
        </div>
        <div className="text-center">
          <span className="text-lg font-semibold text-foreground">
            {rightVal != null ? Number(rightVal).toFixed(3) : "N/A"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Compare Experiments</h1>
          <p className="text-muted-foreground">Compare results from different experiment runs side by side</p>
        </div>

        {/* Experiment Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Experiment A (Previous)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={leftExperimentId?.toString() || ""}
                onValueChange={(val) => setLeftExperimentId(Number(val))}
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
                        Exp #{exp.experiment_id} - {new Date(exp.start_time).toLocaleDateString()}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No experiments found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Experiment B (Current)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={rightExperimentId?.toString() || ""}
                onValueChange={(val) => setRightExperimentId(Number(val))}
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
                        Exp #{exp.experiment_id} - {new Date(exp.start_time).toLocaleDateString()}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No experiments found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {leftExperimentId && rightExperimentId ? (
          <div className="space-y-8">
            {(leftLoading || rightLoading) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : leftExperiment && rightExperiment ? (
              <>
                {/* Details Comparison */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5" />
                      Experiment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center font-medium text-primary">Experiment A</div>
                      <div className="text-center text-muted-foreground">Parameter</div>
                      <div className="text-center font-medium text-primary">Experiment B</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
                        <div className="text-center text-sm">{formatDate(leftExperiment.start_time)}</div>
                        <div className="text-center text-sm text-muted-foreground">Date/Time</div>
                        <div className="text-center text-sm">{formatDate(rightExperiment.start_time)}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
                        <div className="text-center text-sm">{leftExperiment.model_name || "LCCDE"}</div>
                        <div className="text-center text-sm text-muted-foreground">Model</div>
                        <div className="text-center text-sm">{rightExperiment.model_name || "LCCDE"}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2 border-b border-border">
                        <div className="text-center text-sm">{leftExperiment.dataset_name || "CICIDS2017"}</div>
                        <div className="text-center text-sm text-muted-foreground">Dataset</div>
                        <div className="text-center text-sm">{rightExperiment.dataset_name || "CICIDS2017"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parameters Comparison */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center font-medium text-primary">Experiment A</div>
                      <div className="text-center text-muted-foreground">Parameter</div>
                      <div className="text-center font-medium text-primary">Experiment B</div>
                    </div>
                    
                    <div className="space-y-2">
                      {(() => {
                        const allParams = new Set([
                          ...(leftExperiment.parameters?.map(p => p.param_name) || []),
                          ...(rightExperiment.parameters?.map(p => p.param_name) || [])
                        ]);
                        
                        return Array.from(allParams).map(paramName => {
                          const leftParam = leftExperiment.parameters?.find(p => p.param_name === paramName);
                          const rightParam = rightExperiment.parameters?.find(p => p.param_name === paramName);
                          const isDifferent = leftParam?.param_value !== rightParam?.param_value;
                          
                          return (
                            <div 
                              key={paramName} 
                              className={`grid grid-cols-3 gap-4 py-2 border-b border-border ${isDifferent ? 'bg-accent/20' : ''}`}
                            >
                              <div className="text-center text-sm">{leftParam?.param_value || "-"}</div>
                              <div className="text-center text-sm text-muted-foreground">{paramName}</div>
                              <div className="text-center text-sm">{rightParam?.param_value || "-"}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Results Comparison */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Results Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center font-medium text-primary">Experiment A</div>
                      <div className="text-center text-muted-foreground">Metric</div>
                      <div className="text-center font-medium text-primary">Experiment B</div>
                    </div>
                    
                    {leftExperiment.results || rightExperiment.results ? (
                      <div>
                        {renderMetricComparison("Accuracy", leftExperiment.results?.accuracy, rightExperiment.results?.accuracy)}
                        {renderMetricComparison("Precision", leftExperiment.results?.precision, rightExperiment.results?.precision)}
                        {renderMetricComparison("Recall", leftExperiment.results?.recall, rightExperiment.results?.recall)}
                        {renderMetricComparison("F1 Score", leftExperiment.results?.f1_score, rightExperiment.results?.f1_score)}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No results available for comparison
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  One or more experiments not found
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              Select two experiments to compare their results side by side
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
