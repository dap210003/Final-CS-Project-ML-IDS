import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExperiments, useCompareExperiments } from "@/hooks/useExperiments";
import { useMetricComparison } from "@/hooks/useResults";
import { ExperimentSelector } from "@/components/comparison/ExperimentSelector";
import { SideBySideResults } from "@/components/comparison/SideBySideResults";
import { MetricComparison } from "@/components/comparison/MetricComparison";
import { ParameterDiff } from "@/components/comparison/ParameterDiff";
import { ClassWiseResults } from "@/components/results/ClassWiseResults";

export default function CompareExperiments() {
  const navigate = useNavigate();
  
  // State for selected experiments
  const [experimentId1, setExperimentId1] = useState<number | null>(null);
  const [experimentId2, setExperimentId2] = useState<number | null>(null);

  // Fetch experiments list
  const { data: experiments, isLoading: experimentsLoading } = useExperiments(20);

  // Fetch comparison data
  const { 
    data: comparison, 
    isLoading: comparisonLoading 
  } = useCompareExperiments(experimentId1, experimentId2);

  // Fetch metric comparison for charts
  const { 
    data: metricComparison, 
    isLoading: metricsLoading 
  } = useMetricComparison(experimentId1, experimentId2);

  const canCompare = experimentId1 !== null && experimentId2 !== null;
  const isLoading = comparisonLoading || metricsLoading;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Compare Experiments
            </h1>
            <p className="text-muted-foreground">
              Select two experiments to compare their results side by side
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-border hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Run
          </Button>
        </div>

        {/* Experiment Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ExperimentSelector
            experiments={experiments || []}
            selectedId={experimentId1}
            onSelect={setExperimentId1}
            label="Experiment 1"
            excludeId={experimentId2}
          />
          <ExperimentSelector
            experiments={experiments || []}
            selectedId={experimentId2}
            onSelect={setExperimentId2}
            label="Experiment 2"
            excludeId={experimentId1}
          />
        </div>

        {/* Comparison Results */}
        {!canCompare ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground text-lg">
              Select two experiments to start comparison
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground text-lg">
              Loading comparison data...
            </div>
          </div>
        ) : comparison && metricComparison ? (
          <div className="space-y-8">
            {/* Side by Side Results */}
            <SideBySideResults
              experiment1={comparison.experiment_1}
              experiment2={comparison.experiment_2}
            />

            {/* Parameter Differences */}
            <ParameterDiff
              differences={comparison.parameter_differences}
              allParameters={comparison.experiment_1.parameters}
            />

            {/* Metric Comparison Charts */}
            <MetricComparison comparison={metricComparison} />

            {/* Class-wise Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClassWiseResults
                results={comparison.experiment_1.class_results || []}
                title="Experiment 1: Class-wise Results"
              />
              <ClassWiseResults
                results={comparison.experiment_2.class_results || []}
                title="Experiment 2: Class-wise Results"
              />
            </div>

            {/* Improvement Summary */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">Improvement Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(comparison.metric_comparison).map(([metric, data]) => (
                  <div key={metric} className="text-center">
                    <p className="text-sm text-muted-foreground capitalize mb-1">
                      {metric.replace('_', ' ')}
                    </p>
                    <p className={`text-2xl font-bold ${
                      data.difference > 0 
                        ? 'text-green-600' 
                        : data.difference < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {data.difference > 0 ? '+' : ''}
                      {(data.difference * 100).toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-destructive text-lg">
              Failed to load comparison data
            </div>
          </div>
        )}
      </div>
    </div>
  );
}