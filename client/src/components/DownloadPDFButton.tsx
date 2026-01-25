import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Citation } from "./CitationSuggestions";

interface DownloadPDFButtonProps {
  title: string;
  content: string;
  citations: Citation[];
  sourceLang: string;
  targetLang: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function DownloadPDFButton({
  title,
  content,
  citations,
  sourceLang,
  targetLang,
  variant = "default",
  size = "default",
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = trpc.pdf.generateWithCitations.useMutation({
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
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "_")}_with_citations.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast.success("PDF downloaded successfully", {
        description: `${citations.length} citations included`,
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error("Failed to generate PDF", {
        description: error.message,
      });
    },
  });

  const handleDownload = () => {
    setIsGenerating(true);
    generatePDF.mutate({
      title,
      content,
      citations,
      sourceLang,
      targetLang,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating || !content}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download with Citations
        </>
      )}
    </Button>
  );
}
