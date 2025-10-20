import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

type VersionHistoryProps = {
  onRestore?: (content: string) => void;
};

const VersionHistory = ({ onRestore }: VersionHistoryProps) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Document history will be saved here for future reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-8">
          Version history feature coming soon
        </p>
      </CardContent>
    </Card>
  );
};

export default VersionHistory;
