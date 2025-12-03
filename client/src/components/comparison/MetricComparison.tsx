import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricComparison as MetricComparisonType } from "@/types/result";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatPercent } from "@/utils/formatters";

interface MetricComparisonProps {
  comparison: MetricComparisonType;
}

export function MetricComparison({ comparison }: MetricComparisonProps) {
  const { overall_comparison } = comparison;

  // Prepare data for chart
  const chartData = [
    {
      metric: 'Accuracy',
      'Experiment 1': overall_comparison.experiment_1.accuracy * 100,
      'Experiment 2': overall_comparison.experiment_2.accuracy * 100,
    },
    {
      metric: 'Precision',
      'Experiment 1': overall_comparison.experiment_1.precision * 100,
      'Experiment 2': overall_comparison.experiment_2.precision * 100,
    },
    {
      metric: 'Recall',
      'Experiment 1': overall_comparison.experiment_1.recall * 100,
      'Experiment 2': overall_comparison.experiment_2.recall * 100,
    },
    {
      metric: 'F1-Score',
      'Experiment 1': overall_comparison.experiment_1.f1_score * 100,
      'Experiment 2': overall_comparison.experiment_2.f1_score * 100,
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Overall Metrics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="metric" 
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              domain={[90, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Bar 
              dataKey="Experiment 1" 
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Experiment 2" 
              fill="hsl(var(--chart-2))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Class-wise comparison chart */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Class-wise F1-Score Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={Object.entries(comparison.class_comparison).map(([className, data]) => ({
                class: className,
                'Experiment 1': data.experiment_1 * 100,
                'Experiment 2': data.experiment_2 * 100,
              }))}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[90, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="class" 
                type="category" 
                width={100}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Legend />
              <Bar 
                dataKey="Experiment 1" 
                fill="hsl(var(--chart-1))" 
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="Experiment 2" 
                fill="hsl(var(--chart-2))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}