import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const NetworkTraffic = () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    value: Math.random() * 100 + 50,
  }));

  return (
    <Card className="border border-border bg-card p-8">
      <h2 className="mb-6 text-sm font-medium tracking-wider">NETWORK TRAFFIC</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default NetworkTraffic;
