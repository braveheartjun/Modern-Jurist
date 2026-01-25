import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, ScanLine, ArrowRight, CheckCircle2, ShieldCheck, Languages, Loader2, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GlossaryManager, CustomGlossary } from "@/components/GlossaryManager";

// Mock data for demonstration
const DEMO_TRANSLATIONS = {
  hindi: {
    title: "Mukhtarnama Aam (General Power of Attorney)",
    content: `Sarv Sadharan ko is dastavej dwara gyat ho ki...
    
1. Karyakari (Executants): Late Shri Premnath Sharma ke kanooni waris...
2. Mukhtar (Attorney): Mr. Dev Premnath Sharma...

Uprokt Karyakari ne apne adhikar aur hit Tyag aur hastantaran kar diye hain...`
  },
  marathi: {
    title: "Kulmukhtyarpatra (General Power of Attorney)",
    content: `Sarva Sadharanana ya dastavejadware kalvinyat yete ki...

1. Lihun Denar (Executants): Late Shri Premnath Sharma yanche kanooni waris...
2. Lihun Ghenar (Attorney): Mr. Dev Premnath Sharma...

Varil Lihun Denar yanni tyanche hakka ani hit sodun dile ahet...`
  }
};

export default function TranslationWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload");
  const [targetLang, setTargetLang] = useState("hindi");
  const [processingStage, setProcessingStage] = useState("");
  
  // Glossary State
  const [glossaries, setGlossaries] = useState<CustomGlossary[]>([
    {
      id: "1",
      name: "Real Estate Terms",
      language: "Hindi",
      terms: [
        { source: "Grantor", target: "Dene Wala (Grantor)" },
        { source: "Attorney", target: "Mukhtar (Attorney)" }
      ],
      active: true
    }
  ]);

  const activeGlossaryCount = glossaries.filter(g => g.active).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startTranslation = () => {
    if (!file) return;
    setStep("processing");
    setIsProcessing(true);
    
    // Simulate processing stages
    const stages = [
      { p: 10, msg: "Initializing Secure Environment..." },
      { p: 30, msg: "Scanning Document (OCR)..." },
      { p: 50, msg: "Analyzing Legal Context..." },
      { p: 65, msg: "Mapping Clauses & Terminology..." },
      { p: 80, msg: `Applying ${activeGlossaryCount} Custom Glossaries...` },
      { p: 90, msg: "Generating Draft..." },
      { p: 100, msg: "Finalizing..." }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setIsProcessing(false);
        setStep("result");
        return;
      }
      setProgress(stages[currentStage].p);
      setProcessingStage(stages[currentStage].msg);
      currentStage++;
    }, 800);
  };

  return (
    <div className="container max-w-[1600px] py-4 md:py-6 space-y-4 md:space-y-6 animate-in fade-in duration-500 min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border rounded-lg p-4 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Secure</span>
          </div>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <Badge variant="secondary" className="px-2 py-1 text-xs md:text-sm md:px-3">
            v2.1
          </Badge>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <GlossaryManager glossaries={glossaries} onUpdateGlossaries={setGlossaries} />
          {activeGlossaryCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {activeGlossaryCount} Active
            </Badge>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" size="sm" disabled={step !== "result"} className="flex-1 md:flex-none">
             <FileText className="mr-2 h-4 w-4" />
             PDF
           </Button>
           <Button size="sm" disabled={step !== "result"} className="flex-1 md:flex-none">
             DOCX
           </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Panel: Source / Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-full border-l-4 border-l-primary shadow-md">
            <CardHeader>
              <CardTitle>Source Document</CardTitle>
              <CardDescription>Upload PDF, DOCX, or Scanned Image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Upload Area */}
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-primary" />
                      <div className="text-sm font-medium">{file.name}</div>
                      <Badge variant="secondary">Ready to Process</Badge>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <div className="text-sm font-medium text-muted-foreground">Click to Upload or Drag & Drop</div>
                    </>
                  )}
                </label>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Language</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindi">Hindi (Court Standard)</SelectItem>
                      <SelectItem value="marathi">Marathi (Bombay HC)</SelectItem>
                      <SelectItem value="gujarati">Gujarati</SelectItem>
                      <SelectItem value="kannada">Kannada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Type</label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-Detect</SelectItem>
                      <SelectItem value="poa">Power of Attorney</SelectItem>
                      <SelectItem value="contract">Commercial Contract</SelectItem>
                      <SelectItem value="petition">Court Petition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={startTranslation}
                disabled={!file || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Translate Document
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Output / Visualization */}
        <div className="lg:col-span-8">
          <Card className="h-full shadow-md flex flex-col">
            
            {step === "upload" && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                <div className="bg-muted p-6 rounded-full mb-6">
                  <Languages className="h-12 w-12 opacity-50" />
                </div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">Ready to Translate</h3>
                <p className="max-w-md">
                  Upload a legal document to begin. Our engine uses advanced OCR and a database of 150+ legal terms to ensure accuracy.
                </p>
              </div>
            )}

            {step === "processing" && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8">
                <div className="w-full max-w-md space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{processingStage}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-8">
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${progress > 30 ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
                    <ScanLine className={`h-6 w-6 ${progress > 30 ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">OCR</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${progress > 60 ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
                    <FileText className={`h-6 w-6 ${progress > 60 ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">Context</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${progress > 90 ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
                    <CheckCircle2 className={`h-6 w-6 ${progress > 90 ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">Draft</span>
                  </div>
                </div>
              </div>
            )}

            {step === "result" && (
              <div className="flex flex-col h-full">
                <div className="border-b p-3 flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/20 gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">Score: 98%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Verified
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x h-full overflow-hidden">
                  {/* Source Preview */}
                  <div className="flex flex-col h-[300px] md:h-full bg-muted/5">
                    <div className="p-3 border-b bg-muted/10 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original (English)</h4>
                    </div>
                    <ScrollArea className="flex-1 p-4 md:p-6">
                      <div className="space-y-6 text-sm font-serif leading-loose text-foreground/80 max-w-prose mx-auto">
                        <div className="text-center font-bold text-lg border-b pb-4 mb-4">GENERAL POWER OF ATTORNEY</div>
                        <p>KNOW ALL MEN BY THESE PRESENTS that we, the Legal Heirs of Late Shri Premnath Sharma...</p>
                        <div className="pl-4 border-l-2 border-muted-foreground/20 my-4">
                          <p>1. Grantors: [List of Names]</p>
                          <p>2. Attorney: Mr. Dev Premnath Sharma</p>
                        </div>
                        <p>WHEREAS the Grantors have relinquished and transferred all their rights and interests...</p>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Translated Output */}
                  <div className="flex flex-col h-full bg-background">
                    <div className="p-3 border-b bg-primary/5 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                        Translated ({targetLang === 'hindi' ? 'Hindi' : targetLang === 'marathi' ? 'Marathi' : 'Target'})
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">Draft v1.0</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-4 md:p-6">
                      <div className="space-y-6 text-sm font-serif leading-loose text-foreground max-w-prose mx-auto">
                        <div className="text-center font-bold text-lg border-b pb-4 mb-4 text-primary">
                          {targetLang === 'hindi' ? DEMO_TRANSLATIONS.hindi.title : 
                           targetLang === 'marathi' ? DEMO_TRANSLATIONS.marathi.title : 
                           "Translation Preview"}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {targetLang === 'hindi' ? DEMO_TRANSLATIONS.hindi.content : 
                           targetLang === 'marathi' ? DEMO_TRANSLATIONS.marathi.content : 
                           "Translation content generated based on the selected language model..."}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
}
