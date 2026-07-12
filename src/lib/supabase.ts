/**
 * Cliente Supabase.
 *
 * - `supabase` (anon): pode ser usado em Server e Client Components.
 *   Respeita a RLS (leitura pública de ofertas).
 * - `supabaseAdmin` (service_role): SOMENTE em Route Handlers / Server Actions
 *   server-side. Ignora RLS. Nunca importe em arquivos que vão para o client.
 *
 * Se as variáveis não estiverem definidas, retornamos `null` para que o
 * fallback MDX entre em ação (site não quebra em dev).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured: boolean = Boolean(url && anonKey);

/** Cliente anônimo (Server e Client). Lê ofertas com RLS pública. */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/** Cliente admin (Server only). Ignora RLS — use para migrations e admin. */
export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
