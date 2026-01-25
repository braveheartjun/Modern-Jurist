import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Upload, Book, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface GlossaryTerm {
  source: string;
  target: string;
}

export interface CustomGlossary {
  id: string;
  name: string;
  language: string;
  terms: GlossaryTerm[];
  active: boolean;
}

interface GlossaryManagerProps {
  glossaries: CustomGlossary[];
  onUpdateGlossaries: (glossaries: CustomGlossary[]) => void;
}

export function GlossaryManager({ glossaries, onUpdateGlossaries }: GlossaryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newGlossaryName, setNewGlossaryName] = useState("");
  const [newTermSource, setNewTermSource] = useState("");
  const [newTermTarget, setNewTermTarget] = useState("");
  const [currentTerms, setCurrentTerms] = useState<GlossaryTerm[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGlossary = () => {
    if (!newGlossaryName) return;
    
    const newGlossary: CustomGlossary = {
      id: Date.now().toString(),
      name: newGlossaryName,
      language: "Hindi", // Default for now, could be selectable
      terms: currentTerms,
      active: true
    };

    onUpdateGlossaries([...glossaries, newGlossary]);
    setNewGlossaryName("");
    setCurrentTerms([]);
    setIsCreating(false);
  };

  const handleAddTerm = () => {
    if (!newTermSource || !newTermTarget) return;
    setCurrentTerms([...currentTerms, { source: newTermSource, target: newTermTarget }]);
    setNewTermSource("");
    setNewTermTarget("");
  };

  const handleDeleteGlossary = (id: string) => {
    onUpdateGlossaries(glossaries.filter(g => g.id !== id));
  };

  const toggleGlossaryActive = (id: string) => {
    onUpdateGlossaries(glossaries.map(g => 
      g.id === id ? { ...g, active: !g.active } : g
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Book className="h-4 w-4" />
          Manage Glossaries
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Custom Terminology Glossaries</DialogTitle>
          <DialogDescription>
            Upload or create custom glossaries to override default translations for specific terms.
          </DialogDescription>
        </DialogHeader>

        {!isCreating ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Your Glossaries</h3>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            {glossaries.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <Book className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No custom glossaries yet.</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Terms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {glossaries.map((glossary) => (
                      <TableRow key={glossary.id}>
                        <TableCell className="font-medium">{glossary.name}</TableCell>
                        <TableCell>{glossary.language}</TableCell>
                        <TableCell>{glossary.terms.length}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={glossary.active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleGlossaryActive(glossary.id)}
                          >
                            {glossary.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteGlossary(glossary.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Pro Tip:</p>
                <p>You can also upload CSV files directly. Format: Source Term, Target Term</p>
              </div>
              <Button variant="secondary" size="sm" className="ml-auto">
                <Upload className="h-3 w-3 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newGlossaryName}
                  onChange={(e) => setNewGlossaryName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Real Estate Contracts"
                />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Add Terms</h4>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Source (English)" 
                    value={newTermSource}
                    onChange={(e) => setNewTermSource(e.target.value)}
                  />
                  <Input 
                    placeholder="Target (Hindi)" 
                    value={newTermTarget}
                    onChange={(e) => setNewTermTarget(e.target.value)}
                  />
                  <Button size="icon" onClick={handleAddTerm} disabled={!newTermSource || !newTermTarget}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {currentTerms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Add terms to your glossary list.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentTerms.map((term, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-secondary/20 p-2 rounded text-sm">
                          <span>{term.source} → {term.target}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setCurrentTerms(currentTerms.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreateGlossary} disabled={!newGlossaryName || currentTerms.length === 0}>
                Save Glossary
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
