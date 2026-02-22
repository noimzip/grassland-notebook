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
  Database,
  RefreshCw
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
    avatarUrl: storedAvatar,
    isConfigured, 
    tokenStatus,
    isPersistenceEnabled,
    signInWithGitHub,
    setPersistence,
    resetAllData,
    disconnectGitHub,
  } = useSettings();

  const [open, setOpen] = useState(false);

  // Use effective values
  const currentUsername = storedUser;
  const currentAvatar = storedAvatar;

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
            期限切れまたは無効
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
    <Dialog open={open} onOpenChange={setOpen}>
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
                          {isConfigured && currentAvatar ? (
                            <img 
                              src={currentAvatar} 
                              alt={currentUsername}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Github className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{isConfigured ? currentUsername : "未連携"}</p>
                          <p className="text-[10px] text-muted-foreground">{isConfigured ? "GitHub OAuth 連携中" : "連携していません"}</p>
                        </div>
                      </div>
                      {getStatusBadge()}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">セッションの保持</Label>
                          <p className="text-[10px] text-muted-foreground">
                            ブラウザを閉じてもログイン状態を維持します。
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
                      <Github className="w-4 h-4 text-primary" />
                      GitHub 連携
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ボタンをクリックしてGitHubと連携します。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isConfigured ? (
                      <div className="py-8 text-center space-y-4">
                        <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                          <Github className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">GitHubと未連携です</p>
                          <p className="text-xs text-muted-foreground">
                            コントリビューションデータを取得するには連携が必要です。
                          </p>
                        </div>
                        <Button onClick={signInWithGitHub} className="w-full h-11 gap-2 font-bold shadow-md bg-[#24292f] hover:bg-[#24292f]/90 text-white border-none">
                          <Github className="w-5 h-5" />
                          GitHubで連携する
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">連携済み</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Supabase OAuthを通じてGitHub APIへの安全なアクセスが確立されています。
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" onClick={signInWithGitHub} className="w-full gap-2 text-xs h-9">
                          <RefreshCw className="w-3.5 h-3.5" />
                          連携を再更新
                        </Button>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-[10px] text-muted-foreground leading-relaxed">
                        <strong>セキュリティ:</strong> トークンはブラウザに直接保存されず、Supabaseのセッションを通じて安全に管理されます。`read:user` 以外の権限は要求しません。
                      </div>
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
