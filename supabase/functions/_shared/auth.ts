import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Verifies the caller's Supabase access token.
 * Falls back across the possible key env var names so the check keeps working
 * regardless of which key the edge runtime exposes.
 */
export async function verifyUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { user: null, error: "Missing Authorization header" };

  const url = Deno.env.get("SUPABASE_URL");
  const key =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    console.error("Auth check misconfigured: missing SUPABASE_URL or key env var");
    return { user: null, error: "Auth not configured" };
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    console.error("Token verification failed:", error?.message ?? "no user");
    return { user: null, error: error?.message ?? "Invalid token" };
  }
  return { user: data.user, error: null };
}
