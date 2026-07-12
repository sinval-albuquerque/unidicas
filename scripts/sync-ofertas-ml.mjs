#!/usr/bin/env node
/**
 * Sincroniza preços e dados dos produtos em src/content/ofertas/*.mdx
 * com a API oficial do Mercado Livre (/items/MLB<ID>).
 *
 * Para cada oferta:
 *  1. Extrai o mlbId do frontmatter
 *  2. GET /items/MLB<ID> (com auto-refresh do access_token se 401)
 *  3. Compara preco, precoOriginal, linkAfiliado, imagem
 *  4. Se mudou, reescreve o MDX (preservando emDestaque, tags, nota, resumo)
 *  5. Re-migra para o Supabase (upsert idempotente)
 *
 * Uso:
 *   npm run sync:ofertas           # roda em todos os MDX
 *   node scripts/sync-ofertas-ml.mjs --only=slug-1,slug-2  # só alguns
 *   node scripts/sync-ofertas-ml.mjs --dry-run            # não escreve nada
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OFERTAS_DIR = path.join(ROOT, "src", "content", "ofertas");
const TOKENS_FILE = path.join(ROOT, ".ml-tokens.json");
const ENV_FILE = path.join(ROOT, ".env.local");

const MATT_WORD = "unidicasofertas";
const MATT_TOOL = "unidicasofertas";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1].split(",") : null;

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const ENV = { ...process.env, ...loadEnv() };

function loadTokens() {
  if (!fs.existsSync(TOKENS_FILE)) {
    console.error(`❌  Sem ${TOKENS_FILE}. Rode:  node scripts/ml-auth.mjs start && finish`);
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
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: ENV.ML_CLIENT_ID,
    client_secret: ENV.ML_CLIENT_SECRET,
    refresh_token: refreshToken,
  });
  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Refresh falhou: HTTP ${res.status} ${t}`);
  }
  const tok = await res.json();
  saveTokens(tok);
  return tok.access_token;
}

async function mlGet(pathname, accessToken) {
  const url = `https://api.mercadolibre.com${pathname}`;
  let res = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) {
    const t = loadTokens();
    const newToken = await refreshAccessToken(t.refresh_token);
    res = await fetch(url, { headers: { authorization: `Bearer ${newToken}` } });
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${url}  HTTP ${res.status}  ${body.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Multi-get: busca até 20 MLB_IDs em uma única chamada.
 * Retorna Map<mlbId, item | null> (null = item não encontrado / 404).
 */
async function mlMultiGet(ids, accessToken) {
  if (ids.length === 0) return new Map();
  const out = new Map();
  // ML aceita no máximo 20 IDs por chamada
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const qs = chunk.join(",");
    const res = await fetch(`https://api.mercadolibre.com/items?ids=${qs}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 401) {
      const t = loadTokens();
      const newToken = await refreshAccessToken(t.refresh_token);
      // refaz a chamada do chunk com o novo token
      const r2 = await fetch(`https://api.mercadolibre.com/items?ids=${qs}`, {
        headers: { authorization: `Bearer ${newToken}` },
      });
      if (!r2.ok) {
        for (const id of chunk) out.set(id, null);
        continue;
      }
      const arr = await r2.json();
      for (const item of arr) {
        if (item.code === 200 && item.body?.id) out.set(item.body.id, item.body);
        else out.set(chunk.find((id) => id === item.body?.id) || null, null);
      }
      continue;
    }
    if (!res.ok) {
      for (const id of chunk) out.set(id, null);
      continue;
    }
    const arr = await res.json();
    for (const item of arr) {
      if (item.code === 200 && item.body?.id) out.set(item.body.id, item.body);
    }
  }
  return out;
}

function applyAffiliate(permalink) {
  if (!permalink) return null;
  try {
    const u = new URL(permalink);
    u.searchParams.set("matt_word", MATT_WORD);
    u.searchParams.set("pid", MATT_TOOL);
    return u.toString();
  } catch {
    return permalink;
  }
}

function upgradeMlImage(url) {
  return String(url).replace(/-[A-Z]\.webp$/i, "-O.webp");
}

/**
 * Lê frontmatter e body de um MDX sem dependência externa.
 * Tolera CRLF (Windows) e LF.
 */
function parseMdx(text) {
  // Normaliza: remove BOM UTF-8 (\uFEFF) e converte CRLF -> LF.
  const norm = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  if (!norm.startsWith("---\n")) return null;
  const end = norm.indexOf("\n---", 3);
  if (end === -1) return null;
  const fmBlock = norm.slice(4, end);
  const body = norm.slice(end + 4);
  const fm = {};
  for (const line of fmBlock.split("\n")) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/m);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === "true") val = true;
    if (val === "false") val = false;
    fm[m[1]] = val;
  }
  return { fm, body };
}

function renderMdx({ fm, body }, updates) {
  // Preserva tudo do fm original; aplica só updates.
  const merged = { ...fm, ...updates };
  const lines = [
    "---",
    `slug: "${merged.slug}"`,
    merged.mlbId ? `mlbId: "${merged.mlbId}"` : null,
    `titulo: "${String(merged.titulo).replace(/"/g, '\\"')}"`,
    `produto: "${String(merged.produto || merged.titulo).replace(/"/g, '\\"')}"`,
    `categoria: "${merged.categoria}"`,
    `preco: ${merged.preco}`,
    `precoOriginal: ${merged.precoOriginal ?? merged.preco}`,
    `imagem: "${merged.imagem}"`,
    `marketplace: "${merged.marketplace}"`,
    `linkAfiliado: "${merged.linkAfiliado}"`,
    `tags: [${(merged.tags || []).map((t) => `"${String(t).replace(/"/g, '\\"')}"`).join(", ")}]`,
    `emDestaque: ${merged.emDestaque ? "true" : "false"}`,
    `nota: ${merged.nota ?? "null"}`,
    `resumo: "${String(merged.resumo || "").replace(/"/g, '\\"')}"`,
    "---",
  ].filter(Boolean);
  return lines.join("\n") + "\n" + body;
}

async function migrateToSupabase(changedFiles) {
  if (changedFiles.length === 0) return;
  // Reutiliza o script existente, mas só com os arquivos que mudaram.
  // Para simplificar, rodamos o migrate completo (idempotente).
  console.log(`\n→ Re-migrando ${changedFiles.length} arquivo(s) para o Supabase…`);
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("node", ["--env-file=.env.local", "scripts/migrate-ofertas-to-supabase.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error("❌  Migrate falhou — rode manualmente:  npm run ofertas:db:migrate");
  }
}

async function main() {
  const files = fs
    .readdirSync(OFERTAS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(OFERTAS_DIR, f));
  if (files.length === 0) {
    console.log("Nenhum MDX em src/content/ofertas/");
    return;
  }

  const t = loadTokens();
  const accessToken = t.access_token;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const changes = [];

  // Multi-get: 1 chamada pra até 20 IDs.
  const allParsed = [];
  const allIds = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const parsed = parseMdx(text);
    if (!parsed) {
      console.warn(`⚠️  ${path.basename(file)} sem frontmatter válido, pulando.`);
      skipped++;
      continue;
    }
    if (ONLY && !ONLY.includes(parsed.fm.slug)) continue;
    if (!parsed.fm.mlbId) {
      console.warn(`⚠️  ${parsed.fm.slug} sem mlbId, pulando.`);
      skipped++;
      continue;
    }
    allParsed.push({ file, parsed });
    allIds.push(parsed.fm.mlbId);
  }

  console.log(`→ ${allIds.length} oferta(s) para sincronizar (1 chamada / 20 IDs)`);
  const items = await mlMultiGet(allIds, accessToken);

  for (const { file, parsed } of allParsed) {
    const { fm, body } = parsed;
    process.stdout.write(`→ ${fm.slug} (${fm.mlbId}) … `);
    const item = items.get(fm.mlbId);
    if (!item) {
      console.log("não encontrado na API (MLB_ID inválido ou produto despublicado)");
      failed++;
      continue;
    }

    const novoPreco = item.price;
    const novoPrecoOriginal = item.original_price ?? novoPreco;
    const novaImagem = upgradeMlImage(item.secure_thumbnail || item.thumbnail || "");
    const novoLink = applyAffiliate(item.permalink);
    const novoTitulo = item.title;
    const novoProduto = item.title;

    const diffs = [];
    if (Number(fm.preco) !== novoPreco) diffs.push(`preco ${fm.preco} -> ${novoPreco}`);
    if (Number(fm.precoOriginal ?? fm.preco) !== novoPrecoOriginal)
      diffs.push(`precoOriginal ${fm.precoOriginal} -> ${novoPrecoOriginal}`);
    if (fm.imagem && fm.imagem !== novaImagem) diffs.push("imagem");
    if (fm.linkAfiliado !== novoLink) diffs.push("linkAfiliado");

    if (diffs.length === 0) {
      console.log("sem mudança");
      skipped++;
      continue;
    }

    console.log(`mudou (${diffs.join(", ")})`);
    const updatedMdx = renderMdx(parsed, {
      preco: novoPreco,
      precoOriginal: novoPrecoOriginal,
      imagem: novaImagem,
      linkAfiliado: novoLink,
      titulo: novoTitulo,
      produto: novoProduto,
    });
    if (!DRY_RUN) {
      fs.writeFileSync(file, updatedMdx, "utf-8");
      changes.push(file);
      updated++;
    } else {
      console.log("  [dry-run] não escreveu");
      updated++;
    }
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Atualizados: ${updated}  |  Sem mudança: ${skipped}  |  Falhas: ${failed}`);
  if (DRY_RUN) console.log("(DRY-RUN: nenhum arquivo foi escrito)");

  if (changes.length > 0 && !DRY_RUN) {
    await migrateToSupabase(changes);
  }
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
