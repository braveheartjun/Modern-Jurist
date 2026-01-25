import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, BarChart2, Search, Scale, Languages } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-primary">
          <Scale className="h-6 w-6" />
          <div>
            <span className="font-serif text-xl font-bold tracking-tight block leading-none">Modern Jurist</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Legal Translation Suite</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
            System Operational
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}
