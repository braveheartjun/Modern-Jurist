import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Streamdown } from "streamdown";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Analysis() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/report.md")
      .then((res) => res.text())
      .then((text) => {
        setReport(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load report", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-10">Loading analysis report...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Language Analysis Report</h1>
        <p className="text-muted-foreground">Detailed findings on legal language patterns, stylistic elements, and terminology.</p>
      </div>

      <Card className="shadow-sm border-none bg-background">
        <CardContent className="p-8 md:p-12 prose prose-slate max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <Streamdown>{report}</Streamdown>
        </CardContent>
      </Card>
    </div>
  );
}
