import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Save, 
  FileText,
  CheckCircle2,
  Loader2,
  Copy,
  Eye,
  Edit3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SideBySideEditorProps {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  onTranslatedTextChange: (text: string) => void;
  documentTitle?: string;
  citations?: any[];
}

export function SideBySideEditor({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  onTranslatedTextChange,
  documentTitle = "Legal Document",
  citations = []
}: SideBySideEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [localTranslatedText, setLocalTranslatedText] = useState(translatedText);

  // PDF generation mutation
  const generatePDFMutation = trpc.pdf.generateWithCitations.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/\s+/g, "_")}_${targetLang}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate PDF: " + error.message);
    }
  });

  // Update local state when prop changes
  useEffect(() => {
    setLocalTranslatedText(translatedText);
  }, [translatedText]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localTranslatedText !== translatedText) {
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [localTranslatedText]);

  // Full-screen keyboard shortcut (F11 or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullScreen();
      } else if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSave = () => {
    setIsSaving(true);
    onTranslatedTextChange(localTranslatedText);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast.success("Changes saved");
    }, 500);
  };

  const handleDownloadPDF = () => {
    generatePDFMutation.mutate({
      title: documentTitle,
      content: localTranslatedText,
      citations: citations,
      sourceLang: sourceLang,
      targetLang: targetLang
    });
  };

  // DOCX generation mutation
  const generateDOCXMutation = trpc.docx.generateWithCitations.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.docx);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/\s+/g, "_")}_${targetLang}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("DOCX downloaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate DOCX: " + error.message);
    }
  });

  const handleDownloadDOCX = () => {
    generateDOCXMutation.mutate({
      title: documentTitle,
      content: localTranslatedText,
      citations: citations,
      sourceLang: sourceLang,
      targetLang: targetLang
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(localTranslatedText);
    toast.success("Copied to clipboard");
  };

  const containerClass = isFullScreen
    ? "fixed inset-0 z-50 bg-background"
    : "h-full";

  return (
    <div className={containerClass}>
      <Card className="h-full flex flex-col shadow-lg border-2">
        {/* Toolbar */}
        <div className="border-b bg-muted/20 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Translation Complete
            </Badge>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `Saved ${lastSaved.toLocaleTimeString()}`
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Switch to preview mode" : "Switch to edit mode"}
            >
              {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
              {isEditing ? "Preview" : "Edit"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              title="Copy translated text to clipboard"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              title="Save changes (Ctrl+S)"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  {citations.length > 0 ? "Download with Citations" : "Download"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF} disabled={generatePDFMutation.isPending}>
                  <FileText className="h-4 w-4 mr-2" />
                  {citations.length > 0 ? "PDF with Citations" : "Download as PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDOCX} disabled={generateDOCXMutation.isPending}>
                  <FileText className="h-4 w-4 mr-2" />
                  {generateDOCXMutation.isPending ? "Generating..." : citations.length > 0 ? "DOCX with Citations" : "Download as DOCX"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullScreen}
              title={isFullScreen ? "Exit full screen (Esc)" : "Enter full screen (F11)"}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Side-by-Side Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
          {/* Source Document (Read-only) */}
          <div className="flex flex-col h-full bg-muted/5">
            <div className="p-3 border-b bg-muted/10 flex justify-between items-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original ({sourceLang})
              </h4>
              <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
            </div>
            <ScrollArea className="flex-1 p-4 md:p-6">
              <div className="space-y-4 text-sm font-serif leading-loose text-foreground/80 max-w-prose mx-auto">
                {sourceText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Translated Document (Editable) */}
          <div className="flex flex-col h-full bg-background">
            <div className="p-3 border-b bg-primary/5 flex justify-between items-center">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                Translated ({targetLang})
              </h4>
              <Badge variant="secondary" className="text-[10px]">
                {isEditing ? "Editing" : "Preview"}
              </Badge>
            </div>
            <ScrollArea className="flex-1 p-4 md:p-6">
              <div className="max-w-prose mx-auto">
                {isEditing ? (
                  <Textarea
                    value={localTranslatedText}
                    onChange={(e) => setLocalTranslatedText(e.target.value)}
                    className="min-h-[600px] font-serif text-sm leading-loose border-none focus-visible:ring-0 resize-none"
                    placeholder="Translated content will appear here..."
                  />
                ) : (
                  <div className="space-y-4 text-sm font-serif leading-loose text-foreground">
                    {localTranslatedText.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Keyboard Shortcuts Info (only in full-screen) */}
        {isFullScreen && (
          <div className="border-t bg-muted/10 px-4 py-2 text-xs text-muted-foreground flex justify-center gap-6">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> Exit full screen</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">F11</kbd> Toggle full screen</span>
          </div>
        )}
      </Card>
    </div>
  );
}
