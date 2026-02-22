import React, { useState } from "react";
import { Github, Mail, Lock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Background component that renders the animated grid
const ContributionGridBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background transition-colors duration-500">
      {/* Base Grid Pattern */}
      <div 
        className="absolute inset-0 bg-grass-grid opacity-30 dark:opacity-20" 
        style={{ 
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
        }}
      />
      
      {/* Animated Cells */}
      <div className="absolute inset-0 flex flex-wrap gap-1 p-2 opacity-20 sm:opacity-40 dark:opacity-20 pointer-events-none overflow-hidden">
        {Array.from({ length: 400 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-[1px] transition-colors duration-1000",
              // Randomly assign different shades of grass and animation delays
              i % 7 === 0 ? "bg-[var(--grass-4)]" : 
              i % 5 === 0 ? "bg-[var(--grass-3)]" : 
              i % 3 === 0 ? "bg-[var(--grass-2)]" : "bg-[var(--grass-1)]",
              "animate-breathe"
            )}
            style={{
              animationDelay: `${(i % 13) * 0.7}s`,
              animationDuration: `${5 + (i % 5)}s`
            }}
          />
        ))}
      </div>

      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background/30 dark:to-background/50" />
    </div>
  );
};

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // 新規登録
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setMessage("確認メールを送信しました。メールボックスをチェックしてください。");
      } else {
        // ログイン
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "認証に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "read:user",
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "GitHubログインに失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <ContributionGridBackground />
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--grass-2)] to-[var(--grass-4)] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative p-3 bg-card border border-border/50 rounded-xl text-primary shadow-lg transition-colors">
              <Sparkles className="w-8 h-8 text-[var(--grass-3)]" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 transition-colors">
              Grassland Notebook
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto transition-colors">
              一歩ずつの積み重ねを、一生モノの庭園に。
            </p>
          </div>
        </div>

        <Card className="border-border/40 bg-card/90 dark:bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all duration-500">
          {/* Subtle border shine effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--grass-2)] to-transparent opacity-50" />
          
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center font-semibold">
              {isSignUp ? "アカウント作成" : "サインイン"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "新しい庭園を始めましょう" : "あなたの活動記録へアクセス"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                <Sparkles className="w-4 h-4 shrink-0" />
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground/80">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="dev@example.com"
                    className="pl-10 bg-background/50 border-border/50 focus:border-[var(--grass-3)] transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" aria-label="パスワード" className="text-xs uppercase tracking-wider text-muted-foreground/80">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/50 border-border/50 focus:border-[var(--grass-3)] transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[var(--grass-1)] to-[var(--grass-2)] hover:from-[var(--grass-2)] hover:to-[var(--grass-3)] text-white shadow-lg transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    処理中...
                  </div>
                ) : (
                  isSignUp ? "アカウント作成" : "ログイン"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-card px-2 text-muted-foreground/60">
                  または外部アカウントで継続
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              className="w-full border-border/50 hover:bg-muted/50 transition-colors"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHubでログイン
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground border-t border-border/20 pt-6">
            <div className="flex items-center justify-center w-full">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-foreground hover:text-[var(--grass-3)] transition-colors font-medium flex items-center gap-1"
              >
                {isSignUp ? "既にアカウントをお持ちですか？ ログイン" : "新しくアカウントを作成する"}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Grassland Notebook. Build your garden.
        </p>
      </div>
    </div>
  );
}
