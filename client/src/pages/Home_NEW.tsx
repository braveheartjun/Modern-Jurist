/**
 * Redesigned Home Page - Clean, Focused Translation Interface
 * Core flow: Upload → Translate → Download
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "english", name: "English" },
  { code: "hindi", name: "हिंदी (Hindi)" },
  { code: "gujarati", name: "ગુજરાતી (Gujarati)" },
  { code: "marathi", name: "मराठी (Marathi)" },
  { code: "kannada", name: "ಕನ್ನಡ (Kannada)" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState<string>("english");
  const [targetLang, setTargetLang] = useState<string>("hindi");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload PDF, DOCX, or TXT files.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
    toast.success(`File "${selectedFile.name}" loaded successfully`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleTranslate = () => {
    if (!file) {
      toast.error("Please upload a document first");
      return;
    }

    if (sourceLang === targetLang) {
      toast.error("Source and target languages must be different");
      return;
    }

    // Navigate to translation workspace with file and language info
    setLocation(
      `/translate?source=${sourceLang}&target=${targetLang}&file=${encodeURIComponent(file.name)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Legal Translator</h1>
              <p className="text-xs text-slate-500">Indian Regional Languages</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Translate Legal Documents
            </h2>
            <p className="text-lg text-slate-600">
              Professional translation for contracts, agreements, petitions, and legal notices
            </p>
          </div>

          {/* Translation Card */}
          <Card className="p-8 shadow-xl">
            {/* Step 1: Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                1. Upload Document
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : file
                    ? "border-green-500 bg-green-50"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-400"
                }`}
              >
                {file ? (
                  <div className="space-y-3">
                    <FileText className="w-16 h-16 mx-auto text-green-600" />
                    <p className="text-lg font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-16 h-16 mx-auto text-slate-400" />
                    <p className="text-lg font-medium text-slate-700">
                      Drop your document here
                    </p>
                    <p className="text-sm text-slate-500">
                      or click to browse (PDF, DOCX, TXT • Max 10MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) handleFileSelect(selectedFile);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Select Languages */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  2. Source Language
                </label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  3. Target Language
                </label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 3: Translate */}
            <div>
              <Button
                onClick={handleTranslate}
                disabled={!file}
                size="lg"
                className="w-full h-14 text-lg"
              >
                Translate Document
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Accurate Translation</h3>
              <p className="text-sm text-slate-600">
                Context-aware translation using legal terminology database
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Format Preserved</h3>
              <p className="text-sm text-slate-600">
                Maintains document structure, numbering, and formatting
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-600">
                Your documents are processed securely and never stored
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
