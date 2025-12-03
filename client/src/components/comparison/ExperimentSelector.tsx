import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperimentListResponse } from "@/types/experiment";
import { formatDate } from "@/utils/formatters";
import { Calendar, Activity } from "lucide-react";

interface ExperimentSelectorProps {
  experiments: ExperimentListResponse[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  label: string;
  excludeId?: number | null; // To prevent selecting the same experiment twice
}

export function ExperimentSelector({ 
  experiments, 
  selectedId, 
  onSelect, 
  label,
  excludeId 
}: ExperimentSelectorProps) {
  const selectedExperiment = experiments.find(exp => exp.experiment_id === selectedId);
  
  // Filter out excluded experiment
  const availableExperiments = excludeId 
    ? experiments.filter(exp => exp.experiment_id !== excludeId)
    : experiments;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropdown selector */}
        <Select 
          value={selectedId?.toString() || ""} 
          onValueChange={(value) => onSelect(Number(value))}
        >
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Select an experiment" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {availableExperiments.map((exp) => (
              <SelectItem 
                key={exp.experiment_id} 
                value={exp.experiment_id.toString()}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {exp.experiment_name || `Experiment ${exp.experiment_id}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({exp.model_name})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected experiment details */}
        {selectedExperiment && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span className="text-foreground font-medium">
                {formatDate(selectedExperiment.start_time)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Model:</span>
              <span className="text-foreground font-medium">
                {selectedExperiment.model_name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Dataset:</span>
              <span className="text-foreground font-medium">
                {selectedExperiment.dataset_name}
              </span>
            </div>

            {selectedExperiment.overall_f1_score && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">F1-Score:</span>
                <span className="text-foreground font-mono font-bold">
                  {(selectedExperiment.overall_f1_score * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}