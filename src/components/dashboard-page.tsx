import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, LayoutDashboard, Github, CalendarDays } from "lucide-react";
import { GitHubAnalyzer } from "./github-analyzer";
import { YearlyAnalysisDashboard } from "./yearly-analysis-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (error || !user) {
          navigate("/");
        } else {
          setUser(user);
        }
      } catch (err) {
        if (mounted) navigate("/");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getUser();
    
    const timer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mr-4">
              <User className="w-4 h-4" />
              <span>{user?.email || "ゲストユーザー"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-border/50">
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          </div>
        </header>

        <main className="space-y-12">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl border bg-card shadow-lg group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-125" />
            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              <div className="p-5 bg-primary/10 rounded-2xl text-primary shrink-0 shadow-inner">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-bold">おかえりなさい、{user?.email?.split('@')[0] || "ユーザー"} さん</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  今日も小さな一歩を積み重ねていきましょう。GitHub の活動を同期して、あなたの努力の足跡を詳細に分析しましょう。
                </p>
              </div>
            </div>
          </section>

          <Tabs defaultValue="current" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="current" className="gap-2">
                  <Github className="w-4 h-4" />
                  Current Year
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Yearly History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="current" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* GitHub Integration Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                  <Github className="w-3 h-3" />
                  Real-time Analytics
                </div>
                <GitHubAnalyzer />
              </section>
            </TabsContent>

            <TabsContent value="history" className="animate-in fade-in slide-in-from-right-4 duration-500">
              <YearlyAnalysisDashboard />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="pt-12 pb-6 text-center text-xs text-muted-foreground/40 border-t border-border/10">
          &copy; {new Date().getFullYear()} Grassland Notebook. All your contributions in one garden.
        </footer>
      </div>
    </div>
  );
}
