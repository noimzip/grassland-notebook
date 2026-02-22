import { useState, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY_USER = "grassland_github_username";
const STORAGE_KEY_TOKEN = "grassland_github_token";
const STORAGE_KEY_PERSISTENCE = "grassland_persistence_enabled";

export interface SettingsState {
  username: string;
  token: string;
  isPersistenceEnabled: boolean;
  isConfigured: boolean;
  isValidating: boolean;
  tokenStatus: "idle" | "valid" | "invalid" | "checking";
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>({
    username: "",
    token: "",
    isPersistenceEnabled: true,
    isConfigured: false,
    isValidating: false,
    tokenStatus: "idle",
  });

  // Initial load
  useEffect(() => {
    const username = localStorage.getItem(STORAGE_KEY_USER) || "";
    const token = localStorage.getItem(STORAGE_KEY_TOKEN) || "";
    const persistence = localStorage.getItem(STORAGE_KEY_PERSISTENCE) !== "false"; // Default to true

    if (username && token) {
      setSettings((prev) => ({
        ...prev,
        username,
        token,
        isPersistenceEnabled: persistence,
        isConfigured: true,
      }));
      // Auto-validate if configured
      validateToken(token);
    } else {
      setSettings((prev) => ({
        ...prev,
        isPersistenceEnabled: persistence,
      }));
    }
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

  const updateSettings = async (username: string, token: string, persistence: boolean) => {
    const isValid = await validateToken(token);
    
    if (!isValid) {
      toast.error("GitHubトークンが無効です。設定を確認してください。");
      return false;
    }

    if (persistence) {
      localStorage.setItem(STORAGE_KEY_USER, username);
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_PERSISTENCE, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.setItem(STORAGE_KEY_PERSISTENCE, "false");
    }

    setSettings({
      username,
      token,
      isPersistenceEnabled: persistence,
      isConfigured: true,
      isValidating: false,
      tokenStatus: "valid",
    });

    toast.success("設定を保存しました。");
    return true;
  };

  const setPersistence = (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_PERSISTENCE, enabled.toString());
    
    if (!enabled) {
      // If disabling persistence, clear the sensitive data from storage immediately
      // but keep it in state for the current session
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } else if (settings.username && settings.token) {
      // If enabling persistence, save current state to storage
      localStorage.setItem(STORAGE_KEY_USER, settings.username);
      localStorage.setItem(STORAGE_KEY_TOKEN, settings.token);
    }

    setSettings((prev) => ({ ...prev, isPersistenceEnabled: enabled }));
    toast.info(`データのローカル保存を${enabled ? "有効" : "無効"}にしました。`);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_PERSISTENCE);
    // Clear all other potential app data if needed
    // localStorage.clear(); // Use with caution

    setSettings({
      username: "",
      token: "",
      isPersistenceEnabled: true,
      isConfigured: false,
      isValidating: false,
      tokenStatus: "idle",
    });

    toast.success("すべての設定とデータを初期化しました。");
  };

  const disconnectGitHub = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    
    setSettings((prev) => ({
      ...prev,
      username: "",
      token: "",
      isConfigured: false,
      tokenStatus: "idle",
    }));

    toast.info("GitHub連携を解除しました。");
  };

  return {
    ...settings,
    updateSettings,
    setPersistence,
    resetAllData,
    disconnectGitHub,
    validateToken,
    // Aliases for backward compatibility
    saveAuth: updateSettings,
    clearAuth: disconnectGitHub,
  };
}
