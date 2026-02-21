import React, { useState, useEffect } from "react";
import { 
  Github, 
  Lock, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useGitHubAuth } from "@/hooks/use-github-auth";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function GitHubSettings() {
  const { username: storedUser, token: storedToken, isConfigured, saveAuth, clearAuth } = useGitHubAuth();
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [open, setOpen] = useState(false);

  // Sync state with stored values when opening the dialog
  useEffect(() => {
    if (open) {
      setUsername(storedUser);
      setToken(storedToken);
    }
  }, [open, storedUser, storedToken]);

  const handleSave = () => {
    if (username && token) {
      saveAuth(username, token);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/50 transition-colors">
          <Settings className="w-4 h-4" />
          GitHub 設定
          {isConfigured && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Github className="w-5 h-5" />
            </div>
            <DialogTitle>GitHub 連携設定</DialogTitle>
          </div>
          <DialogDescription>
            コントリビューションデータを取得するための認証情報を設定します。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gh-username">GitHub ユーザー名</Label>
            <Input
              id="gh-username"
              placeholder="octocat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-muted/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="gh-token">Personal Access Token (Classic)</Label>
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-primary flex items-center gap-1 hover:underline"
              >
                トークンを発行 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="gh-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-9 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              ※ `read:user` スコープのみが必要です。
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>プライバシー保護:</strong> 入力された情報はブラウザのローカルストレージにのみ保存され、外部サーバーに送信されることはありません。
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isConfigured && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                  <Trash2 className="w-4 h-4" />
                  設定を解除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>設定を解除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    保存されているユーザー名とトークンがブラウザから完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAuth} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleSave} disabled={!username || !token} className="gap-2">
            設定を保存
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
