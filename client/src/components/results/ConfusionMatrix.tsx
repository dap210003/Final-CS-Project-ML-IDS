import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfusionMatrixData } from "@/types/result";

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  title?: string;
}

export function ConfusionMatrix({ data, title = "Confusion Matrix" }: ConfusionMatrixProps) {
  const { matrix, labels } = data;

  // Calculate max value for color scaling
  const maxValue = Math.max(...matrix.flat());

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    const intensity = value / maxValue;
    // Use green for correct predictions (diagonal), blue for incorrect
    return intensity;
  };

  // Check if cell is on diagonal (correct prediction)
  const isCorrectPrediction = (row: number, col: number) => row === col;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Matrix container */}
            <div className="grid gap-1" style={{ 
              gridTemplateColumns: `60px repeat(${labels.length}, minmax(60px, 1fr))` 
            }}>
              {/* Top-left corner cell (empty) */}
              <div className="h-12" />
              
              {/* Column headers (Predicted) */}
              {labels.map((label, idx) => (
                <div 
                  key={`col-${idx}`}
                  className="h-12 flex items-center justify-center text-xs font-semibold text-center border-b-2 border-border"
                >
                  <div className="transform -rotate-45 origin-center whitespace-nowrap">
                    {label}
                  </div>
                </div>
              ))}

              {/* Matrix rows */}
              {matrix.map((row, rowIdx) => (
                <>
                  {/* Row header (True) */}
                  <div 
                    key={`row-${rowIdx}`}
                    className="flex items-center justify-end pr-2 text-xs font-semibold"
                  >
                    {labels[rowIdx]}
                  </div>
                  
                  {/* Matrix cells */}
                  {row.map((value, colIdx) => {
                    const intensity = getColorIntensity(value);
                    const isCorrect = isCorrectPrediction(rowIdx, colIdx);
                    const bgColor = isCorrect
                      ? `rgba(34, 197, 94, ${0.1 + intensity * 0.7})` // Green for correct
                      : `rgba(59, 130, 246, ${0.1 + intensity * 0.7})`; // Blue for incorrect

                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className="aspect-square flex items-center justify-center text-sm font-mono border border-border rounded transition-all hover:scale-105 hover:z-10 hover:shadow-lg cursor-pointer"
                        style={{ backgroundColor: bgColor }}
                        title={`True: ${labels[rowIdx]}, Predicted: ${labels[colIdx]}, Count: ${value}`}
                      >
                        {value}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
                <span>Correct Predictions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500/50" />
                <span>Misclassifications</span>
              </div>
            </div>

            {/* Axis labels */}
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <div>
                <strong>True Label:</strong> Row
              </div>
              <div>
                <strong>Predicted Label:</strong> Column
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}