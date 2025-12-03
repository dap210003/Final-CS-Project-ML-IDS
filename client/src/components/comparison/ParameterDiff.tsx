import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";

interface ParameterDiffProps {
  differences: {
    [key: string]: {
      experiment_1: string;
      experiment_2: string;
    };
  };
  allParameters: {
    [key: string]: string;
  };
}

export function ParameterDiff({ differences, allParameters }: ParameterDiffProps) {
  const hasChanges = Object.keys(differences).length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Parameter Differences</span>
          <Badge variant="secondary">
            {Object.keys(differences).length} changed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasChanges ? (
          <div className="space-y-3">
            {Object.entries(differences).map(([param, values]) => (
              <div 
                key={param}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {param.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs">
                    Changed
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Experiment 1</p>
                    <code className="px-2 py-1 bg-background rounded border border-border">
                      {values.experiment_1}
                    </code>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Experiment 2</p>
                    <code className="px-2 py-1 bg-background rounded border border-border">
                      {values.experiment_2}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-green-600" />
            <span>All parameters are identical</span>
          </div>
        )}

        {/* Show some unchanged parameters */}
        {Object.keys(allParameters).length > Object.keys(differences).length && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Show unchanged parameters ({Object.keys(allParameters).length - Object.keys(differences).length})
            </summary>
            <div className="mt-3 space-y-2">
              {Object.entries(allParameters)
                .filter(([key]) => !differences[key])
                .map(([param, value]) => (
                  <div 
                    key={param}
                    className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                  >
                    <span className="text-muted-foreground">
                      {param.replace(/_/g, ' ')}
                    </span>
                    <code className="text-xs px-2 py-1 bg-background rounded">
                      {value}
                    </code>
                  </div>
                ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}