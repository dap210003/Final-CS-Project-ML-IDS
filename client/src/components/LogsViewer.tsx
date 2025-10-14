import { Card } from "@/components/ui/card";

const LogsViewer = () => {
  const logs = [
    "24 43 2020  171212 1 IP.168,8.5.6",
    "24 43 2020  171212 1 192.168,0.181",
    "24 43 2020  171122 1 192.168,0.136",
    "24 43 2020  171002 1 192.168,0.181",
  ];

  return (
    <Card className="border border-border bg-card p-8">
      <h2 className="mb-6 text-sm font-medium tracking-wider">VIEW LOGS</h2>
      <div className="space-y-2 font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="text-muted-foreground">
            {log}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LogsViewer;
