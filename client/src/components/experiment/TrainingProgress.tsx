import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface TrainingProgressProps {
  status: string;
  progress: number;
  currentEpoch?: number;
  totalEpochs?: number;
  currentMetrics?: {
    loss?: number;
    accuracy?: number;
  };
}

export function TrainingProgress({ 
  status, 
  progress, 
  currentEpoch, 
  totalEpochs,
  currentMetrics 
}: TrainingProgressProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Training Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{status}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Epoch information */}
        {currentEpoch !== undefined && totalEpochs !== undefined && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Epoch</span>
              <span className="text-foreground font-medium">
                {currentEpoch} / {totalEpochs}
              </span>
            </div>
          </div>
        )}

        {/* Current metrics */}
        {currentMetrics && (
          <div className="pt-2 space-y-2 border-t border-border">
            {currentMetrics.loss !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loss</span>
                <span className="text-foreground font-mono">
                  {currentMetrics.loss.toFixed(4)}
                </span>
              </div>
            )}
            {currentMetrics.accuracy !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="text-foreground font-mono">
                  {(currentMetrics.accuracy * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status messages */}
        <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t border-border">
          <p>• Data preprocessing completed</p>
          <p>• Training base models...</p>
          {progress > 50 && <p>• Evaluating performance...</p>}
          {progress > 80 && <p>• Building ensemble model...</p>}
        </div>
      </CardContent>
    </Card>
  );
}