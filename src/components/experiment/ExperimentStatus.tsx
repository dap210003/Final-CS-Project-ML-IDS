import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface ExperimentStatusProps {
  status: 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
}

export function ExperimentStatus({ 
  status, 
  startTime, 
  endTime, 
  errorMessage 
}: ExperimentStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: 'Running',
          variant: 'secondary' as const,
          className: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: 'Completed',
          variant: 'secondary' as const,
          className: 'bg-green-500/10 text-green-600 border-green-500/20'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Failed',
          variant: 'destructive' as const,
          className: 'bg-red-500/10 text-red-600 border-red-500/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-2">
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        <span className="ml-2">{config.label}</span>
      </Badge>

      {/* Time information */}
      {startTime && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Started: {new Date(startTime).toLocaleString()}</span>
        </div>
      )}
      
      {endTime && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Ended: {new Date(endTime).toLocaleString()}</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && status === 'failed' && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  );
}