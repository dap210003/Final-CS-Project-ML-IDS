import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ModelPerformance = () => {
  const metrics = [
    { value: 85 },
    { value: 92 },
    { value: 78 },
  ];

  return (
    <Card className="border border-border bg-card p-8">
      <h2 className="mb-6 text-sm font-medium tracking-wider">MODEL PERFORMANCE</h2>
      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <Progress key={index} value={metric.value} className="h-6" />
        ))}
      </div>
    </Card>
  );
};

export default ModelPerformance;
