import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, RotateCcw, User, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

interface VersionHistoryProps {
  documentId: string;
  onRestore: (content: string, versionId: number) => void;
}

export function VersionHistory({ documentId, onRestore }: VersionHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  const versionsQuery = trpc.version.list.useQuery(
    { documentId },
    {
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  );

  const versionDetailQuery = trpc.version.getById.useQuery(
    { versionId: selectedVersionId! },
    {
      enabled: selectedVersionId !== null,
    }
  );

  const handleRestore = (versionId: number, content: string) => {
    onRestore(content, versionId);
    toast.success("Version restored", {
      description: `Document reverted to version #${versionId}`,
    });
  };

  const versions = versionsQuery.data?.versions || [];

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Version History</CardTitle>
          {versions.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {versions.length} {versions.length === 1 ? "version" : "versions"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {versionsQuery.isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Loading version history...
          </div>
        ) : versions.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {versions.map((version, index) => (
                <Card
                  key={version.id}
                  className={`border-l-4 cursor-pointer transition-colors ${
                    selectedVersionId === version.id
                      ? "border-l-primary bg-primary/5"
                      : "border-l-muted hover:border-l-primary/50"
                  }`}
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  <CardContent className="p-4 space-y-2">
                    {/* Version Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                          {index === 0 ? "Latest" : `v${versions.length - index}`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{version.id}
                        </span>
                      </div>
                      {index !== 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version.id, version.content);
                          }}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{version.userName}</span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>

                    {/* Change Description */}
                    {version.changeDescription && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground italic">
                          {version.changeDescription}
                        </p>
                      </>
                    )}

                    {/* Content Preview */}
                    {selectedVersionId === version.id && versionDetailQuery.data?.version && (
                      <>
                        <Separator className="my-2" />
                        <div className="text-xs bg-muted/50 p-2 rounded max-h-32 overflow-y-auto">
                          <div className="font-mono whitespace-pre-wrap">
                            {versionDetailQuery.data.version.content.substring(0, 200)}
                            {versionDetailQuery.data.version.content.length > 200 && "..."}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No version history yet. Edits will be automatically tracked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
