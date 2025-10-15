import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
