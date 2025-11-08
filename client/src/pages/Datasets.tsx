import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

export default function Datasets() {
  const datasets = [
    {
      name: "CICIDS2017",
      records: "2,830,743",
      features: "78",
      classes: "15",
      status: "Active",
    },
    {
      name: "NSL-KDD",
      records: "148,517",
      features: "41",
      classes: "5",
      status: "Active",
    },
    {
      name: "UNSW-NB15",
      records: "2,540,044",
      features: "49",
      classes: "10",
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Datasets</h1>
          <p className="text-muted-foreground">Manage benchmark network traffic datasets for IDS research</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Card key={dataset.name} className="bg-card border-border hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="h-8 w-8 text-primary" />
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {dataset.status}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{dataset.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Records</span>
                  <span className="text-foreground font-medium">{dataset.records}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Features</span>
                  <span className="text-foreground font-medium">{dataset.features}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Classes</span>
                  <span className="text-foreground font-medium">{dataset.classes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
