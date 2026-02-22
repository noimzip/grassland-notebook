import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY_PERSISTENCE = "grassland_persistence_enabled";

export interface SettingsState {
  username: string;
  token: string;
  avatarUrl: string;
  isPersistenceEnabled: boolean;
  isConfigured: boolean;
  isValidating: boolean;
  tokenStatus: "idle" | "valid" | "invalid" | "checking";
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>({
    username: "",
    token: "",
    avatarUrl: "",
    isPersistenceEnabled: true,
    isConfigured: false,
    isValidating: false,
    tokenStatus: "idle",
  });

  // Supabaseから情報を取得
  const loadFromSupabase = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (sessionError || userError || !session || !user) {
      return;
    }

    const username = user.user_metadata.user_name || user.user_metadata.full_name || "";
    const avatarUrl = user.user_metadata.avatar_url || "";
    const token = session.provider_token || ""; // OAuth provider token
    const persistence = localStorage.getItem(STORAGE_KEY_PERSISTENCE) !== "false";

    setSettings((prev) => ({
      ...prev,
      username,
      token,
      avatarUrl,
      isPersistenceEnabled: persistence,
      isConfigured: !!token,
      tokenStatus: token ? "valid" : "idle",
    }));
  };

  useEffect(() => {
    loadFromSupabase();

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadFromSupabase();
    });

    return () => subscription.unsubscribe();
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    if (!tokenToValidate) return;
    
    setSettings((prev) => ({ ...prev, tokenStatus: "checking", isValidating: true }));
    
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        setSettings((prev) => ({ ...prev, tokenStatus: "valid", isValidating: false }));
        return true;
      } else {
        setSettings((prev) => ({ ...prev, tokenStatus: "invalid", isValidating: false }));
        return false;
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setSettings((prev) => ({ ...prev, tokenStatus: "invalid", isValidating: false }));
      return false;
    }
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user",
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error("GitHub連携に失敗しました: " + error.message);
      return false;
    }
    return true;
  };

  const setPersistence = (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_PERSISTENCE, enabled.toString());
    setSettings((prev) => ({ ...prev, isPersistenceEnabled: enabled }));
    toast.info(`データのローカル保存を${enabled ? "有効" : "無効"}にしました。`);
  };

  const resetAllData = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY_PERSISTENCE);

    setSettings({
      username: "",
      token: "",
      avatarUrl: "",
      isPersistenceEnabled: true,
      isConfigured: false,
      isValidating: false,
      tokenStatus: "idle",
    });

    toast.success("ログアウトし、すべての設定を初期化しました。");
  };

  const disconnectGitHub = async () => {
    // OAuthの場合、トークンのみを無効化することは難しいため、基本的にはログアウトを促す
    await supabase.auth.signOut();
    toast.info("GitHub連携を解除（ログアウト）しました。");
  };

  return {
    ...settings,
    signInWithGitHub,
    setPersistence,
    resetAllData,
    disconnectGitHub,
    validateToken,
    // Aliases for backward compatibility
    saveAuth: async () => {}, // 手動保存は不要に
    clearAuth: disconnectGitHub,
  };
}

