#!/usr/bin/env node
/**
 * Autenticação OAuth2 no Mercado Livre (credenciais do app Unidicas).
 *
 * Usa PKCE (code_verifier + code_challenge) por segurança.
 * Persiste access_token e refresh_token em .ml-tokens.json (gitignored).
 *
 * Subcomandos:
 *   start   - Passo 1: gera verifier+challenge, imprime URL de authorize
 *             (abrir no navegador, autorizar, copiar o ?code=)
 *   finish  - Passo 2: troca o ?code= por access+refresh token
 *   refresh - Renova o access_token usando o refresh_token salvo
 *   whoami  - Mostra o user_id (testa se o token ainda é válido)
 *
 * Env vars (.env.local ou env):
 *   ML_CLIENT_ID       - ID do app (ex.: 1269027321439553)
 *   ML_CLIENT_SECRET   - secret (não commitar)
 *   ML_REDIRECT_URI    - ex.: https://unidicas.com.br
 *
 * Uso:
 *   node scripts/ml-auth.mjs start
 *   # abre URL no navegador, autoriza, copia o ?code=...
 *   node scripts/ml-auth.mjs finish --code=TG-...
 *   node scripts/ml-auth.mjs whoami
 *   node scripts/ml-auth.mjs refresh
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const TOKENS_FILE = path.join(process.cwd(), ".ml-tokens.json");
const AUTH_URL = "https://auth.mercadolivre.com.br/authorization";
const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const CLIENT_ID = env.ML_CLIENT_ID;
const CLIENT_SECRET = env.ML_CLIENT_SECRET;
const REDIRECT_URI = env.ML_REDIRECT_URI || "https://unidicas.com.br";

function b64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function makeVerifier() {
  // 32 bytes -> base64url ~43 chars (43–128 permitido pelo spec)
  return b64url(crypto.randomBytes(32));
}

function challengeFrom(verifier) {
  return b64url(crypto.createHash("sha256").update(verifier).digest());
}

function loadVerifier() {
  const file = path.join(process.cwd(), ".ml-pkce.json");
  if (!fs.existsSync(file)) {
    console.error(`❌  Sem .ml-pkce.json. Rode \`node scripts/ml-auth.mjs start\` primeiro.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function loadTokens() {
  if (!fs.existsSync(TOKENS_FILE)) {
    console.error(`❌  Sem .ml-tokens.json. Rode \`finish\` ou \`start\` + \`finish\` primeiro.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf-8"));
}

function saveTokens(t) {
  const enriched = {
    ...t,
    saved_at: new Date().toISOString(),
    expires_at: t.expires_in
      ? new Date(Date.now() + t.expires_in * 1000).toISOString()
      : null,
  };
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(enriched, null, 2));
  console.log(`✅  Tokens salvos em ${TOKENS_FILE}`);
  if (enriched.expires_at) {
    console.log(`   access_token expira em ${enriched.expires_at}`);
  }
}

async function start() {
  if (!CLIENT_ID) {
    console.error("❌  ML_CLIENT_ID não definido em .env.local");
    process.exit(1);
  }
  const verifier = makeVerifier();
  const challenge = challengeFrom(verifier);
  fs.writeFileSync(
    path.join(process.cwd(), ".ml-pkce.json"),
    JSON.stringify({ verifier, challenge, created_at: new Date().toISOString() }, null, 2),
  );

  const u = new URL(AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", REDIRECT_URI);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  // sem scope = tokens sem scope (refresh_token vem mesmo assim)

  console.log("PKCE salvo em .ml-pkce.json");
  console.log("\nAbra esta URL no navegador, autorize, e copie o ?code=… que aparece na URL de retorno:\n");
  console.log(u.toString());
}

async function finish(code) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌  ML_CLIENT_ID e ML_CLIENT_SECRET precisam estar em .env.local");
    process.exit(1);
  }
  const { verifier } = loadVerifier();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌  HTTP ${res.status}`);
    console.error(text);
    process.exit(1);
  }
  saveTokens(JSON.parse(text));
}

async function refresh() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌  ML_CLIENT_ID e ML_CLIENT_SECRET precisam estar em .env.local");
    process.exit(1);
  }
  const t = loadTokens();
  if (!t.refresh_token) {
    console.error("❌  Sem refresh_token salvo. Refaça o start+finish.");
    process.exit(1);
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: t.refresh_token,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌  HTTP ${res.status}`);
    console.error(text);
    process.exit(1);
  }
  saveTokens(JSON.parse(text));
}

async function whoami() {
  const t = loadTokens();
  const res = await fetch("https://api.mercadolibre.com/users/me", {
    headers: { authorization: `Bearer ${t.access_token}` },
  });
  console.log(`HTTP ${res.status}`);
  console.log(await res.text());
}

// CLI
const [, , sub, ...rest] = process.argv;
const arg = (name) => {
  const m = rest.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=").slice(1).join("=") : null;
};

try {
  if (sub === "start") await start();
  else if (sub === "finish") {
    const code = arg("code") || process.argv[3];
    if (!code) {
      console.error("Uso: node scripts/ml-auth.mjs finish --code=TG-...");
      process.exit(1);
    }
    await finish(code);
  } else if (sub === "refresh") await refresh();
  else if (sub === "whoami") await whoami();
  else {
    console.log("Uso: node scripts/ml-auth.mjs <start|finish --code=…|refresh|whoami>");
    process.exit(1);
  }
} catch (e) {
  console.error("❌", e.message);
  process.exit(1);
}
