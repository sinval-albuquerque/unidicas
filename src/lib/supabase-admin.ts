/**
 * Cliente Supabase ADMIN (service_role).
 *
 * IGNORA RLS — acesso total ao banco.
 * NUNCA importe em Client Components ou arquivos que vão para o bundle.
 * Use SOMENTE em Route Handlers, Server Actions e scripts admin.
 *
 * Se a env var não estiver definida, retorna null (fallback silencioso).
 */

import "server-only";
import { createClient } from "@supabase/supabase-js";

let _admin: ReturnType<typeof createClient> | null = null;

export async function getSupabaseAdmin() {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY não configurada — modo fallback.",
    );
    return null;
  }

  _admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
