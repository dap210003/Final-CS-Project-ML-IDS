import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaderModel } from "@/types/result";
import { formatMetric } from "@/utils/formatters";
import { Crown } from "lucide-react";

interface LeaderModelsTableProps {
  leaderModels: LeaderModel[];
  title?: string;
}

export function LeaderModelsTable({ 
  leaderModels, 
  title = "LCCDE Leader Models" 
}: LeaderModelsTableProps) {
  // Get color for model badge
  const getModelColor = (modelName: string) => {
    switch (modelName) {
      case 'LightGBM':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'XGBoost':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CatBoost':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Count how many times each model is a leader
  const modelCounts = leaderModels.reduce((acc, leader) => {
    acc[leader.base_model_name] = (acc[leader.base_model_name] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const mostFrequentLeader = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            {title}
          </CardTitle>
          
          {/* Summary badge */}
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {mostFrequentLeader?.[0]}: {mostFrequentLeader?.[1]} classes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            Best performing base model for each attack type
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Attack Type</TableHead>
              <TableHead>Leader Model</TableHead>
              <TableHead className="text-right">F1-Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderModels.map((leader) => (
              <TableRow key={leader.type_code}>
                <TableCell className="font-medium">
                  {leader.type_name}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getModelColor(leader.base_model_name)}
                  >
                    {leader.base_model_name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatMetric(leader.f1_score)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Model summary */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-semibold mb-2">Model Distribution:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(modelCounts).map(([model, count]) => (
              <div 
                key={model}
                className="flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-border"
              >
                <Badge 
                  variant="outline" 
                  className={`${getModelColor(model)} text-xs`}
                >
                  {model}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? 'class' : 'classes'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}