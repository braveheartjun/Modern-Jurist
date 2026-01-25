import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Filter } from "lucide-react";

interface Document {
  title: string;
  type: string;
  source: string;
  language: string;
  file: string;
  has_bilingual: boolean;
}

export default function DocumentExplorer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load original database
        const dbRes = await fetch("/data/database.json");
        const dbData = await dbRes.json();
        const originalDocs: Document[] = [];
        Object.values(dbData.by_language).forEach((docs: any) => {
          originalDocs.push(...docs);
        });

        // Load new scraped data
        try {
          const scrapedRes = await fetch("/src/data/scraped_documents.json");
          if (scrapedRes.ok) {
            const scrapedData = await scrapedRes.json();
            // Map scraped data to Document interface
            const newDocs = scrapedData.map((d: any) => ({
              title: d.title,
              type: d.type,
              source: d.source,
              language: d.language.toLowerCase(),
              file: d.url,
              has_bilingual: !!d.hindi_url
            }));
            originalDocs.push(...newDocs);
          }
        } catch (e) {
          console.warn("Could not load scraped documents", e);
        }

        setDocuments(originalDocs);
        setFilteredDocs(originalDocs);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let result = documents;

    if (searchQuery) {
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(doc => doc.type === typeFilter);
    }

    if (langFilter !== "all") {
      result = result.filter(doc => doc.language === langFilter);
    }

    setFilteredDocs(result);
  }, [searchQuery, typeFilter, langFilter, documents]);

  if (loading) return <div className="flex justify-center p-10">Loading documents...</div>;

  const uniqueTypes = Array.from(new Set(documents.map(d => d.type)));
  const uniqueLangs = Array.from(new Set(documents.map(d => d.language)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Document Explorer</h1>
        <p className="text-muted-foreground">Browse and search through the collected legal documents.</p>
      </div>

      {/* Filters */}
      <Card className="bg-secondary/30 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={langFilter} onValueChange={setLangFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {uniqueLangs.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-secondary text-secondary-foreground border-none">
                  {doc.type}
                </Badge>
                <Badge variant="secondary" className={
                  doc.language === 'english' ? "bg-blue-100 text-blue-800" : 
                  doc.language === 'hindi' ? "bg-orange-100 text-orange-800" :
                  doc.language === 'gujarati' ? "bg-green-100 text-green-800" :
                  doc.language === 'marathi' ? "bg-purple-100 text-purple-800" :
                  "bg-yellow-100 text-yellow-800"
                }>
                  {doc.language.charAt(0).toUpperCase() + doc.language.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-lg font-serif leading-tight group-hover:text-primary transition-colors">
                {doc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Source: {doc.source}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <FileText className="w-3 h-3" />
                View Document Details
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No documents found matching your criteria.
        </div>
      )}
    </div>
  );
}
