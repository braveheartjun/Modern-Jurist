import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QualityScorePanelProps {
  qualityScore: {
    overall: number;
    confidence: "high" | "medium" | "low";
    factors: {
      terminologyMatch: number;
      corpusSimilarity: number;
      complexity: number;
    };
    details: string;
  };
}

export function QualityScorePanel({ qualityScore }: QualityScorePanelProps) {
  const getConfidenceIcon = () => {
    switch (qualityScore.confidence) {
      case "high":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getConfidenceColor = () => {
    switch (qualityScore.confidence) {
      case "high":
        return "text-green-700 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-700 bg-red-50 border-red-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getConfidenceIcon()}
          <h3 className="font-semibold text-sm">Translation Quality Score</h3>
        </div>
        <Badge variant="outline" className={getConfidenceColor()}>
          {qualityScore.overall}% {qualityScore.confidence.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Overall Score */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium">Overall Quality</span>
            <span className="text-muted-foreground">{qualityScore.overall}%</span>
          </div>
          <Progress value={qualityScore.overall} className="h-2" />
        </div>

        {/* Terminology Match */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    Terminology Match
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <span className="text-muted-foreground">{qualityScore.factors.terminologyMatch}%</span>
                </div>
                <Progress 
                  value={qualityScore.factors.terminologyMatch} 
                  className="h-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Measures how many legal terms from our database were used in the translation.
                Higher scores indicate better use of established legal terminology.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Corpus Similarity */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    Corpus Similarity
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <span className="text-muted-foreground">{qualityScore.factors.corpusSimilarity}%</span>
                </div>
                <Progress 
                  value={qualityScore.factors.corpusSimilarity} 
                  className="h-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Indicates how many similar documents exist in our corpus for reference.
                Higher scores mean more contextual examples were available.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Complexity */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    Text Complexity
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <span className="text-muted-foreground">{qualityScore.factors.complexity}%</span>
                </div>
                <Progress 
                  value={qualityScore.factors.complexity} 
                  className="h-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Measures the complexity of the source text. Lower complexity means
                simpler language and higher translation confidence.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Details */}
      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {qualityScore.details}
        </p>
      </div>

      {/* Recommendation */}
      {qualityScore.overall < 70 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">Manual Review Recommended</p>
            <p>This translation has a lower confidence score. Please review carefully and make necessary adjustments.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
