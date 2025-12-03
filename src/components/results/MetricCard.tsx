import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { formatMetric, getImprovementColor } from "@/utils/formatters";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number; // For comparison view
  previousValue?: number; // For comparison view
  format?: 'number' | 'percent';
}

export function MetricCard({ 
  label, 
  value, 
  change, 
  previousValue,
  format = 'number' 
}: MetricCardProps) {
  const displayValue = typeof value === 'number' 
    ? (format === 'percent' ? `${(value * 100).toFixed(2)}%` : formatMetric(value))
    : value;

  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <ArrowUpIcon className="h-4 w-4" />;
    if (change < 0) return <ArrowDownIcon className="h-4 w-4" />;
    return <MinusIcon className="h-4 w-4" />;
  };

  const changeColor = change !== undefined ? getImprovementColor(change) : '';

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        {/* Label */}
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        
        {/* Value */}
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-foreground">{displayValue}</p>
          
          {/* Change indicator */}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
              {getChangeIcon()}
              <span>
                {format === 'percent' 
                  ? `${(Math.abs(change) * 100).toFixed(2)}%`
                  : formatMetric(Math.abs(change))}
              </span>
            </div>
          )}
        </div>

        {/* Previous value */}
        {previousValue !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            Previous: {format === 'percent' 
              ? `${(previousValue * 100).toFixed(2)}%`
              : formatMetric(previousValue)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}