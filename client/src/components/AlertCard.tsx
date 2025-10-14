import { Card } from "@/components/ui/card";

const AlertCard = () => {
  return (
    <Card className="border border-border bg-card p-8">
      <div className="text-center">
        <div className="text-8xl font-bold tracking-tight">42</div>
        <div className="mt-4 text-lg font-medium tracking-wider">ALERTS</div>
      </div>
    </Card>
  );
};

export default AlertCard;
