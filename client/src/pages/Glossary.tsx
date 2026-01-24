import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";

interface GlossaryData {
  english: Record<string, Record<string, string>>;
  hindi: Record<string, Record<string, string>>;
}

export default function Glossary() {
  const [glossary, setGlossary] = useState<GlossaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/glossary.json")
      .then((res) => res.json())
      .then((data) => {
        setGlossary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load glossary", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-10">Loading glossary...</div>;
  if (!glossary) return <div>Failed to load glossary</div>;

  const renderTerms = (terms: Record<string, string>) => {
    const filteredTerms = Object.entries(terms).filter(([term, def]) => 
      term.toLowerCase().includes(searchQuery.toLowerCase()) || 
      def.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredTerms.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map(([term, def]) => (
          <Card key={term} className="hover:bg-secondary/20 transition-colors">
            <CardContent className="p-4">
              <h3 className="font-serif font-bold text-lg text-primary mb-1">{term}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{def}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCategory = (categoryName: string, terms: Record<string, string>) => {
    const content = renderTerms(terms);
    if (!content) return null;
    
    return (
      <div key={categoryName} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 capitalize">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          {categoryName.replace(/_/g, ' ')}
        </h2>
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Terminology Glossary</h1>
        <p className="text-muted-foreground">Comprehensive definitions of legal terms in English and Hindi.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search terms or definitions..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="english" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="english" className="px-8">English Terms</TabsTrigger>
          <TabsTrigger value="hindi" className="px-8">Hindi Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="english" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {Object.entries(glossary.english).map(([category, terms]) => 
            renderCategory(category, terms)
          )}
        </TabsContent>

        <TabsContent value="hindi" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {Object.entries(glossary.hindi).map(([category, terms]) => 
            renderCategory(category, terms)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
