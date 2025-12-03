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
import { ClassResultDetail } from "@/types/result";
import { formatMetric } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

interface ClassWiseResultsProps {
  results: ClassResultDetail[];
  title?: string;
}

export function ClassWiseResults({ results, title = "Class-wise Results" }: ClassWiseResultsProps) {
  // Get best and worst performing classes
  const sortedByF1 = [...results].sort((a, b) => b.f1_score - a.f1_score);
  const bestClass = sortedByF1[0];
  const worstClass = sortedByF1[sortedByF1.length - 1];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            Performance metrics for each attack type
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Attack Type</TableHead>
              <TableHead className="text-right">Precision</TableHead>
              <TableHead className="text-right">Recall</TableHead>
              <TableHead className="text-right">F1-Score</TableHead>
              <TableHead className="text-right">Support</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const isBest = result.type_name === bestClass?.type_name;
              const isWorst = result.type_name === worstClass?.type_name;
              
              return (
                <TableRow key={result.type_code}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {result.type_name}
                      {isBest && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                          Best
                        </Badge>
                      )}
                      {isWorst && results.length > 1 && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 text-xs">
                          Lowest
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMetric(result.precision)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMetric(result.recall)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMetric(result.f1_score)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {result.support}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}