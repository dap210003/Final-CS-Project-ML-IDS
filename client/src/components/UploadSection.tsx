import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const UploadSection = () => {
  return (
    <Card className="border border-border bg-card p-8">
      <h2 className="mb-6 text-sm font-medium tracking-wider">UPLOAD DATASET</h2>
      <div className="space-y-4">
        <Button variant="outline" className="w-full justify-center">
          CHOOSE FILE
        </Button>
        <Button className="w-full justify-center bg-secondary hover:bg-secondary/80">
          <Upload className="mr-2 h-4 w-4" />
          UPLOAD
        </Button>
      </div>
    </Card>
  );
};

export default UploadSection;
