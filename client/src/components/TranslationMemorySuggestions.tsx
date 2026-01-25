import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Brain, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TranslationMemorySuggestionsProps {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  onAccept: (targetText: string) => void;
  onDismiss: (suggestionId: number) => void;
}

export function TranslationMemorySuggestions({
  sourceText,
  sourceLang,
  targetLang,
  onAccept,
  onDismiss,
}: TranslationMemorySuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const suggestionsQuery = trpc.translationMemory.findSimilar.useQuery(
    {
      sourceText,
      sourceLang,
      targetLang,
      limit: 5,
    },
    {
      enabled: sourceText.length > 10, // Only search if there's meaningful text
    }
  );

  useEffect(() => {
    // Reset dismissed IDs when source text changes significantly
    setDismissedIds(new Set());
  }, [sourceText]);

  const handleAccept = (suggestion: any) => {
    onAccept(suggestion.targetText);
    toast.success("Translation applied", {
      description: "Suggestion from translation memory",
    });
  };

  const handleDismiss = (suggestionId: number) => {
    setDismissedIds((prev) => new Set(prev).add(suggestionId));
    onDismiss(suggestionId);
  };

  const suggestions = suggestionsQuery.data?.suggestions || [];
  const visibleSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  if (!sourceText || sourceText.length < 10) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Translation Memory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            Start typing to see suggestions from previous translations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Translation Memory</CardTitle>
          </div>
          {visibleSuggestions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {visibleSuggestions.length} {visibleSuggestions.length === 1 ? "match" : "matches"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {suggestionsQuery.isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Searching translation memory...
          </div>
        ) : visibleSuggestions.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {visibleSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4 space-y-3">
                    {/* Source Text */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Previously Translated:
                      </div>
                      <div className="text-sm bg-muted/50 p-2 rounded">
                        {suggestion.sourceText}
                      </div>
                    </div>

                    {/* Target Text */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Suggested Translation:
                      </div>
                      <div className="text-sm font-semibold text-primary bg-primary/5 p-2 rounded">
                        {suggestion.targetText}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Used {suggestion.usageCount}x
                      </Badge>
                      {suggestion.documentType && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.documentType}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        by {suggestion.userName}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccept(suggestion)}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDismiss(suggestion.id)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No similar translations found. Your translations will be saved for future reference.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
