import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, BarChart2, Search, Scale } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart2 },
    { href: "/documents", label: "Document Explorer", icon: FileText },
    { href: "/glossary", label: "Terminology Glossary", icon: BookOpen },
    { href: "/analysis", label: "Language Analysis", icon: Search },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar fixed h-full hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-8 w-8" />
            <span className="font-serif text-xl font-bold tracking-tight">Modern Jurist</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Indian Legal Language Database</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-serif font-semibold text-sm mb-1">Research Project</h4>
            <p className="text-xs text-muted-foreground">
              Analysis of legal terminology across 5 Indian languages.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 px-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-6 w-6" />
            <span className="font-serif text-lg font-bold">Modern Jurist</span>
          </div>
        </header>
        
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
