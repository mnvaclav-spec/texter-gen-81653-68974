import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DocumentVersion = {
  id: string;
  content: string;
  version: number;
  created_at: string;
  template: string;
  input: string;
};

type VersionHistoryProps = {
  onRestore: (content: string) => void;
};

const VersionHistory = ({ onRestore }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      console.error("Error loading versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = (version: DocumentVersion) => {
    onRestore(version.content);
    toast({
      title: "Version Restored",
      description: `Restored version ${version.version} from ${new Date(version.created_at).toLocaleDateString()}`,
    });
  };

  const handlePreview = (version: DocumentVersion) => {
    setSelectedVersion(version);
    setIsPreviewOpen(true);
  };

  if (versions.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No saved documents yet. Generate documentation to see versions here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View and restore previous versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{version.template}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                      {version.input}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(version)}
                      className="border-border"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRestore(version)}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Document Preview</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedVersion && `Version from ${new Date(selectedVersion.created_at).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="rounded-md border border-border bg-background p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                {selectedVersion?.content}
              </pre>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistory;
