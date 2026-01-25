import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Terminology {
  [category: string]: { [term: string]: number } | string[];
}

interface Database {
  terminology_index: {
    english: Terminology;
    hindi: Terminology;
    gujarati: Terminology;
    marathi: Terminology;
    kannada: Terminology;
  };
}

export default function Glossary() {
  const [data, setData] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/database.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-10">Loading glossary...</div>;
  if (!data) return <div>Error loading data</div>;

  const categories = ["court_related", "legal_concepts", "parties"];
  const languages = ["english", "hindi", "gujarati", "marathi", "kannada"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Legal Terminology Glossary</h1>
        <p className="text-muted-foreground">Comparative index of legal terms across five languages.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search terms..." 
          className="pl-9 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="court_related" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="court_related">Court & Procedure</TabsTrigger>
          <TabsTrigger value="legal_concepts">Legal Concepts</TabsTrigger>
          <TabsTrigger value="parties">Parties & Roles</TabsTrigger>
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category.replace("_", " ")} Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {languages.map(lang => (
                        <TableHead key={lang} className="capitalize font-bold text-primary">
                          {lang}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 
                      Note: This is a simplified view. In a real app, we would align terms by meaning.
                      Here we list the top terms extracted for each language in this category.
                    */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {languages.map(lang => {
                          // @ts-ignore
                          const terms = data.terminology_index[lang]?.[category];
                          let term = "-";
                          
                          if (Array.isArray(terms)) {
                            term = terms[i] || "-";
                          } else if (terms && typeof terms === 'object') {
                            term = Object.keys(terms)[i] || "-";
                          }
                          
                          return (
                            <TableCell key={lang} className="font-medium">
                              {term}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
