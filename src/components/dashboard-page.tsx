import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[var(--grass-3)]" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            ログアウト
          </Button>
        </header>

        <main className="grid gap-6">
          <section className="p-6 rounded-xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">ようこそ、{user?.email} さん</h2>
                <p className="text-sm text-muted-foreground">あなたの努力の記録を開始しましょう。</p>
              </div>
            </div>
          </section>

          <section className="grid sm:grid-cols-2 gap-4 text-center">
            <div className="p-8 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">現在のストリーク</p>
            </div>
            <div className="p-8 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">総コントリビューション</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
