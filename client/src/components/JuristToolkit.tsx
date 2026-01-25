import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Library, FileText, ExternalLink, X } from "lucide-react";
import { CustomGlossary } from "./GlossaryManager";

interface JuristToolkitProps {
  glossaries: CustomGlossary[];
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
}

interface ReferenceDoc {
  title: string;
  type: string;
  source: string;
  language: string;
  file: string;
}

export function JuristToolkit({ glossaries, isOpen, onClose, selectedText }: JuristToolkitProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("glossary");
  const [referenceDocs, setReferenceDocs] = useState<ReferenceDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Auto-search when text is selected
  useEffect(() => {
    if (selectedText) {
      setSearchQuery(selectedText);
    }
  }, [selectedText]);

  // Load reference documents
  useEffect(() => {
    const loadDocs = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch("/data/database.json");
        const data = await res.json();
        const allDocs: ReferenceDoc[] = [];
        Object.values(data.by_language).forEach((docs: any) => {
          allDocs.push(...docs);
        });
        setReferenceDocs(allDocs);
      } catch (err) {
        console.error("Failed to load reference docs", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDocs();
  }, []);

  const filteredDocs = referenceDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allTerms = glossaries.flatMap(g => g.terms);
  const filteredTerms = allTerms.filter(term => 
    term.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-background h-full flex flex-col shadow-xl fixed right-0 top-16 bottom-0 z-30 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex justify-between items-center bg-muted/10">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <h3 className="font-serif font-semibold">Jurist Toolkit</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms or docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
            <TabsTrigger value="reference">Reference</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="glossary" className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {searchQuery && (
                <div className="text-xs text-muted-foreground mb-2">
                  Results for "{searchQuery}"
                </div>
              )}
              
              {filteredTerms.length > 0 ? (
                filteredTerms.map((term, idx) => (
                  <Card key={idx} className="shadow-sm">
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{term.source}</div>
                      <div className="text-xs text-muted-foreground mt-1 mb-2">English</div>
                      <div className="bg-muted/50 p-2 rounded text-sm font-medium text-primary">
                        {term.target}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No terms found.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reference" className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {loadingDocs ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading library...</div>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {doc.title}
                        </div>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                          {doc.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 capitalize">
                          {doc.language}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {doc.source}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Library className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No documents found.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
