import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// Generate sample ROC curve data
const generateROCData = () => {
  const data = [];
  for (let i = 0; i <= 100; i++) {
    const fpr = i / 100;
    // ROC curve formula approximation for good classifier
    const tpr = 1 - Math.pow(1 - fpr, 0.3);
    data.push({
      fpr: fpr,
      tpr: tpr,
      diagonal: fpr,
    });
  }
  return data;
};

export function ROCCurve() {
  const data = generateROCData();

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="fpr"
            label={{ value: "False Positive Rate", position: "insideBottom", offset: -5, fill: "hsl(var(--muted-foreground))" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--popover-foreground))",
            }}
          />
          <Area
            type="monotone"
            dataKey="tpr"
            stroke="hsl(var(--chart-blue))"
            strokeWidth={2}
            fill="url(#rocGradient)"
          />
          <Line
            type="monotone"
            dataKey="diagonal"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
