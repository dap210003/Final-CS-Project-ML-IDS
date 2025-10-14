import { Card } from "@/components/ui/card";

const SystemStatus = () => {
  const statusItems = [
    { label: "NORMAL OPERATION", value: "" },
    { label: "CPU USAGE", value: "" },
    { label: "MEMORY USAGE", value: "" },
  ];

  return (
    <Card className="border border-border bg-card p-8">
      <h2 className="mb-6 text-sm font-medium tracking-wider">SYSTEM STATUS</h2>
      <div className="space-y-4">
        {statusItems.map((item, index) => (
          <div key={index} className="text-sm tracking-wide">
            {item.label}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SystemStatus;
