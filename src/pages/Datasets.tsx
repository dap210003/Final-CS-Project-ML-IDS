import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, CheckCircle } from "lucide-react";

export default function Datasets() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Datasets</h1>
          <p className="text-muted-foreground">
            Local dataset available for intrusion detection experiments
          </p>
        </div>

        <Card className="bg-card border-border hover:border-primary transition-colors max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Database className="h-8 w-8 text-primary" />
              <Badge 
                variant="outline" 
                className="bg-success/10 text-success border-success/20"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Available Locally
              </Badge>
            </div>
            <CardTitle className="mt-4">CIC-IDS2017</CardTitle>
            <CardDescription className="text-muted-foreground">
              Network intrusion detection dataset from Canadian Institute for Cybersecurity containing benign and attack traffic captured over 5 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Records</span>
                <span className="text-foreground font-medium">2,830,743</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Features</span>
                <span className="text-foreground font-medium">78</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Classes</span>
                <span className="text-foreground font-medium">15</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground text-sm block mb-2">Attack Types</span>
              <div className="flex flex-wrap gap-1.5">
                {["Brute Force", "DoS", "DDoS", "Web Attack", "Infiltration", "Bot", "Heartbleed"].map((attack) => (
                  <Badge key={attack} variant="secondary" className="text-xs">
                    {attack}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Location:</span> lccde_project/data/raw/
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-muted/30 border-border max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Dataset Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The CICIDS2017 dataset is stored locally in your project at <code className="bg-muted px-1 rounded">lccde_project/data/raw/</code>.
            </p>
            <p>
              When running experiments, the LCCDE model will automatically load and preprocess this dataset.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
