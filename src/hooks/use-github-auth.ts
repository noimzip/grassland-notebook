import { useState, useEffect } from "react";

const STORAGE_KEY_USER = "grassland_github_username";
const STORAGE_KEY_TOKEN = "grassland_github_token";

export interface GitHubAuth {
  username: string;
  token: string;
  isConfigured: boolean;
}

/**
 * useGitHubAuth Hook
 * 
 * Manages GitHub credentials persistence in localStorage.
 * 
 * SECURITY NOTE: 
 * Storing a Personal Access Token in localStorage is convenient but carries risks:
 * 1. XSS Vulnerability: If an attacker can inject a script into your site, they can read the token.
 * 2. Physical/Device Access: Anyone with access to the browser's developer tools can see the token.
 * 
 * RECOMMENDATION for Production:
 * - Use a secure backend to handle OAuth or proxy requests.
 * - If using local storage, minimize token permissions (e.g., read:user only).
 */
export function useGitHubAuth() {
  const [auth, setAuth] = useState<GitHubAuth>({
    username: "",
    token: "",
    isConfigured: false
  });

  // Load from storage on mount
  useEffect(() => {
    const username = localStorage.getItem(STORAGE_KEY_USER) || "";
    const token = localStorage.getItem(STORAGE_KEY_TOKEN) || "";
    
    if (username && token) {
      setAuth({ username, token, isConfigured: true });
    }
  }, []);

  const saveAuth = (username: string, token: string) => {
    localStorage.setItem(STORAGE_KEY_USER, username);
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    setAuth({ username, token, isConfigured: true });
  };

  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setAuth({ username: "", token: "", isConfigured: false });
  };

  return { ...auth, saveAuth, clearAuth };
}
