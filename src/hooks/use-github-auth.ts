import { useSettings } from "./use-settings";

/**
 * useGitHubAuth Hook (Legacy Wrapper)
 * 
 * Re-exports useSettings for backward compatibility.
 * Use useSettings directly for new features.
 */
export function useGitHubAuth() {
  const settings = useSettings();
  
  return {
    username: settings.username,
    token: settings.token,
    isConfigured: settings.isConfigured,
    saveAuth: settings.saveAuth,
    clearAuth: settings.clearAuth,
  };
}
