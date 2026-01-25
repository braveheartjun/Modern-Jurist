import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, ExternalLink, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface Citation {
  id: string;
  originalText: string;
  suggestedCitation: string;
  caseTitle: string;
  year: string;
  court: string;
  reporter: string;
  volume?: string;
  page?: string;
  startIndex: number;
  endIndex: number;
}

interface CitationSuggestionsProps {
  text: string;
  onAccept: (citation: Citation) => void;
  onDismiss: (citationId: string) => void;
}

export function CitationSuggestions({ text, onAccept, onDismiss }: CitationSuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  const generateMutation = trpc.citation.generate.useMutation({
    onError: (error) => {
      toast.error("Failed to generate citations", {
        description: error.message,
      });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ text });
  };

  const handleAccept = (citation: Citation) => {
    onAccept(citation);
    toast.success("Citation accepted", {
      description: `Added ${citation.suggestedCitation} to the document`,
    });
  };

  const handleDismiss = (citationId: string) => {
    setDismissedIds(prev => new Set(prev).add(citationId));
    onDismiss(citationId);
  };

  const citations = generateMutation.data?.citations || [];
  const visibleCitations = citations.filter(c => !dismissedIds.has(c.id));

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Citation Suggestions</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !text}
          >
            {generateMutation.isPending ? "Analyzing..." : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generateMutation.isPending ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Analyzing document for case references...
          </div>
        ) : visibleCitations.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {visibleCitations.map((citation) => (
                <Card key={citation.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4 space-y-3">
                    {/* Original Text */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Found Reference:
                      </div>
                      <div className="text-sm bg-muted/50 p-2 rounded italic">
                        "{citation.originalText}"
                      </div>
                    </div>

                    {/* Suggested Citation */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Suggested Citation:
                      </div>
                      <div className="text-sm font-mono font-semibold text-primary bg-primary/5 p-2 rounded">
                        {citation.suggestedCitation}
                      </div>
                    </div>

                    {/* Case Details */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {citation.court}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {citation.year}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {citation.reporter}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <strong>Case:</strong> {citation.caseTitle}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccept(citation)}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDismiss(citation.id)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Dismiss
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : generateMutation.isSuccess ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No case references detected in the document.
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Click "Generate" to analyze the document for case law references and get properly
            formatted citations.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
