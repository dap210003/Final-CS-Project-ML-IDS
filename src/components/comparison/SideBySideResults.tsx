import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperimentDetailResponse } from "@/types/experiment";
import { MetricCard } from "@/components/results/MetricCard";
import { formatMetric, formatDuration } from "@/utils/formatters";
import { Clock, Zap } from "lucide-react";

interface SideBySideResultsProps {
  experiment1: ExperimentDetailResponse;
  experiment2: ExperimentDetailResponse;
}

export function SideBySideResults({ experiment1, experiment2 }: SideBySideResultsProps) {
  // Calculate improvements
  const accuracyImprovement = 
    (experiment2.overall_accuracy || 0) - (experiment1.overall_accuracy || 0);
  const precisionImprovement = 
    (experiment2.overall_precision || 0) - (experiment1.overall_precision || 0);
  const recallImprovement = 
    (experiment2.overall_recall || 0) - (experiment1.overall_recall || 0);
  const f1Improvement = 
    (experiment2.overall_f1_score || 0) - (experiment1.overall_f1_score || 0);

  return (
    <div className="space-y-6">
      {/* Overall metrics comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Overall Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experiment 1 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Experiment 1: {experiment1.experiment_name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard 
                  label="Accuracy" 
                  value={experiment1.overall_accuracy || 0}
                  format="number"
                />
                <MetricCard 
                  label="Precision" 
                  value={experiment1.overall_precision || 0}
                  format="number"
                />
                <MetricCard 
                  label="Recall" 
                  value={experiment1.overall_recall || 0}
                  format="number"
                />
                <MetricCard 
                  label="F1-Score" 
                  value={experiment1.overall_f1_score || 0}
                  format="number"
                />
              </div>
            </div>

            {/* Experiment 2 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Experiment 2: {experiment2.experiment_name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard 
                  label="Accuracy" 
                  value={experiment2.overall_accuracy || 0}
                  change={accuracyImprovement}
                  previousValue={experiment1.overall_accuracy}
                  format="number"
                />
                <MetricCard 
                  label="Precision" 
                  value={experiment2.overall_precision || 0}
                  change={precisionImprovement}
                  previousValue={experiment1.overall_precision}
                  format="number"
                />
                <MetricCard 
                  label="Recall" 
                  value={experiment2.overall_recall || 0}
                  change={recallImprovement}
                  previousValue={experiment1.overall_recall}
                  format="number"
                />
                <MetricCard 
                  label="F1-Score" 
                  value={experiment2.overall_f1_score || 0}
                  change={f1Improvement}
                  previousValue={experiment1.overall_f1_score}
                  format="number"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training time comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Training Time Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Experiment 1</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-lg font-mono">
                  {formatDuration(experiment1.training_time)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Experiment 2</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-lg font-mono">
                  {formatDuration(experiment2.training_time)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}