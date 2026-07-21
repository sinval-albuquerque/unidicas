/**
 * Cliente Supabase ANON (público).
 *
 * Pode ser usado em Server e Client Components.
 * Respeita a RLS (leitura pública de ofertas).
 *
 * Para o cliente admin (service_role), use:
 *   import { getSupabaseAdmin } from "@/lib/supabase-admin";
 *
 * Se as variáveis não estiverem definidas, retornamos `null` para que o
 * fallback MDX entre em ação (site não quebra em dev).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured: boolean = Boolean(url && anonKey);

/** Cliente anônimo (Server e Client). Lê ofertas com RLS pública. */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
