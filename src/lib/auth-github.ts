import { supabase } from "./supabase";

/**
 * GitHub OAuthを使用してログインを開始します
 */
export async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      // コントリビューション取得に必要なスコープ
      scopes: "read:user",
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw error;
}

/**
 * 現在のセッションから GitHub のアクセストークンを取得します
 * ※ provider_token はログイン直後のセッションに含まれます
 */
export async function getGitHubProviderToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) return null;
  
  // SupabaseはOAuth連携時に provider_token をセッションに含めます
  return session.provider_token;
}

/**
 * 現在のユーザー情報を取得します
 */
export async function getGitHubUserData() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    username: user.user_metadata.user_name || user.user_metadata.full_name,
    avatar_url: user.user_metadata.avatar_url,
    email: user.email,
  };
}
