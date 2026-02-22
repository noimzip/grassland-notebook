import React, { useState } from "react";
import { 
  Github, 
  Lock, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
  Save,
  LogOut,
  Database
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsPage() {
  const { 
    username: storedUser, 
    token: storedToken, 
    isConfigured, 
    tokenStatus,
    isPersistenceEnabled,
    updateSettings,
    setPersistence,
    resetAllData,
    disconnectGitHub,
    validateToken
  } = useSettings();

  const [username, setUsername] = useState(storedUser || "");
  const [token, setToken] = useState(storedToken || "");
  const [showToken, setShowToken] = useState(false);
  const [open, setOpen] = useState(false);

  // Use effective values (state or stored)
  const currentUsername = username || storedUser;
  const currentToken = token || storedToken;

  const handleSave = async () => {
    const success = await updateSettings(username, token, isPersistenceEnabled);
    if (success) {
      // Keep state in sync or let the hook handle it
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setUsername(storedUser);
      setToken(storedToken);
    }
  };

  const getStatusBadge = () => {
    switch (tokenStatus) {
      case "valid":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            接続済み
          </div>
        );
      case "invalid":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            無効なトークン
          </div>
        );
      case "checking":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium animate-pulse">
            確認中...
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/15 rounded-xl text-primary ring-1 ring-primary/20">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">環境設定</DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  GitHub 連携とデータの保存設定を管理します。
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 mb-4 h-11 ring-1 ring-border/50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2">
                <User className="w-4 h-4" />
                プロフィール
              </TabsTrigger>
              <TabsTrigger value="connection" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2">
                <Github className="w-4 h-4" />
                接続設定
              </TabsTrigger>
              <TabsTrigger value="danger" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-muted-foreground data-[state=active]:text-destructive">
                <ShieldAlert className="w-4 h-4" />
                危険地帯
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[320px]">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0 space-y-4 animate-in fade-in-50 duration-300">
                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      GitHub ユーザー
                    </CardTitle>
                    <CardDescription className="text-xs">
                      現在連携されているユーザー情報です。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 overflow-hidden shadow-inner">
                          {isConfigured && currentUsername ? (
                            <img 
                              src={`https://github.com/${currentUsername}.png`} 
                              alt={currentUsername}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentUsername}&background=0D8ABC&color=fff`;
                              }}
                            />
                          ) : (
                            <Github className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{isConfigured ? currentUsername : "未ログイン"}</p>
                          <p className="text-[10px] text-muted-foreground">{isConfigured ? "GitHub コントリビューター" : "連携していません"}</p>
                        </div>
                      </div>
                      {getStatusBadge()}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">データのローカル保存</Label>
                          <p className="text-[10px] text-muted-foreground">
                            ブラウザを閉じても情報を保持します。
                          </p>
                        </div>
                        <Switch 
                          checked={isPersistenceEnabled}
                          onCheckedChange={setPersistence}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Connection Tab */}
              <TabsContent value="connection" className="mt-0 space-y-4 animate-in fade-in-50 duration-300">
                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      認証設定
                    </CardTitle>
                    <CardDescription className="text-xs">
                      GitHub APIにアクセスするための情報を設定します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gh-username" className="text-xs font-medium px-1">GitHub ユーザー名</Label>
                      <Input
                        id="gh-username"
                        placeholder="octocat"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-muted/30 border-border/50 h-10 transition-all focus:bg-background focus:ring-1 ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center px-1">
                        <Label htmlFor="gh-token" className="text-xs font-medium">Personal Access Token (Classic)</Label>
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=read:user&description=Grassland%20Notebook" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary font-medium flex items-center gap-1 hover:underline transition-all"
                        >
                          トークンを発行 <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          id="gh-token"
                          type={showToken ? "text" : "password"}
                          placeholder="ghp_xxxxxxxxxxxx"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="pl-9 pr-10 bg-muted/30 border-border/50 h-10 transition-all focus:bg-background focus:ring-1 ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 px-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <p className="text-[10px] text-muted-foreground">
                          `read:user` スコープのみが必要です。
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={!username || !token} 
                        className="w-full h-10 gap-2 shadow-sm font-semibold"
                      >
                        <Save className="w-4 h-4" />
                        設定を保存
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Danger Zone Tab */}
              <TabsContent value="danger" className="mt-0 space-y-4 animate-in fade-in-50 duration-300">
                <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-sm ring-1 ring-destructive/10">
                  <CardHeader className="pb-3 text-destructive">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      危険地帯
                    </CardTitle>
                    <CardDescription className="text-xs text-destructive/70">
                      これらの操作は取り消すことができません。慎重に行ってください。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-destructive">GitHub 連携の解除</p>
                        <p className="text-[10px] text-muted-foreground max-w-[200px]">
                          認証トークンを削除し、ログイン前の状態に戻ります。
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={disconnectGitHub}
                        className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all h-8 text-[11px]"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1.5" />
                        解除
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-destructive">すべてのデータを初期化</p>
                        <p className="text-[10px] text-muted-foreground max-w-[200px]">
                          設定、トークン、キャッシュを含むすべてのデータを完全に削除します。
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="h-8 text-[11px] font-semibold shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            初期化
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-none shadow-2xl overflow-hidden p-0 max-w-[400px]">
                          <div className="bg-destructive/10 p-6">
                            <AlertDialogHeader>
                              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive mb-4 mx-auto ring-4 ring-destructive/5">
                                <Trash2 className="w-6 h-6" />
                              </div>
                              <AlertDialogTitle className="text-center text-xl font-bold">本当に初期化しますか？</AlertDialogTitle>
                              <AlertDialogDescription className="text-center text-xs leading-relaxed px-4">
                                この操作を実行すると、ブラウザに保存されているすべての設定とデータが完全に削除されます。この操作は元に戻せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto h-10 border-muted-foreground/20 bg-background/50 backdrop-blur-sm">
                                キャンセル
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={resetAllData}
                                className="w-full sm:w-auto h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                              >
                                すべて削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>

                <div className="px-1 space-y-2">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Database className="w-3 h-3 mt-0.5" />
                    <p className="text-[9px] leading-tight">
                      あなたのデータはプライベートです。すべての情報はブラウザの `localStorage` にのみ保存され、外部のデータベースやサーバーに同期されることはありません。
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
