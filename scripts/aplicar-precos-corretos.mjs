/**
 * aplicar-precos-corretos.mjs
 *
 * Lê as fontes disponíveis (HTML fresh de /c/ferramentas + HTMLs salvos
 * de /c/ofertas em scripts/ofertas-p*.html) e atualiza, in-place, os MDX
 * em src/content/ofertas/ cujo mlbId bate. Preserva TUDO do MDX
 * (titulo, produto, tags, emDestaque, nota, resumo, imagem existente)
 * e só troca preco, precoOriginal, linkAfiliado.
 *
 * Estratégia: para cada MDX com mlbId, extrai preco+precoOriginal+url da
 * primeira fonte que tiver o MLB_ID e reescreve o frontmatter.
 *
 * Uso:
 *   node scripts/aplicar-precos-corretos.mjs --dry-run   # só mostra
 *   node scripts/aplicar-precos-corretos.mjs             # aplica
 *
 * Após aplicar, rode:
 *   npm run ofertas:db:migrate
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OFERTAS_DIR = path.join(ROOT, "src", "content", "ofertas");

const DRY_RUN = process.argv.includes("--dry-run");

const SOURCES = [
  "scripts/_ferramentas-fresh.html",
  ...fs
    .readdirSync("scripts")
    .filter((f) => /^ofertas-p\d+\.html$/.test(f))
    .map((f) => path.join("scripts", f))
    .sort(),
];

/** Extrai preco+precoOriginal+url do HTML para o MLB_ID (1ª ocorrência). */
function extract(html, mlbId) {
  const hrefRe = new RegExp(
    `href="(https?://(?:www\\.)?mercadolivre\\.com\\.br/([a-z0-9-]+)/p/${mlbId}[^"]*)"`,
  );
  const m = html.match(hrefRe);
  if (!m) return null;
  const rawUrl = m[1];
  const idx = m.index;

  const tail = html.slice(idx, idx + 4000);
  const afterHref = tail.slice(rawUrl.length);
  const stopRe = /href="https?:\/\/(?:www\.)?mercadolivre\.com\.br\/[a-z0-9-]+\/p\//g;
  const stopMatch = stopRe.exec(afterHref);
  const window = stopMatch ? afterHref.slice(0, stopMatch.index) : afterHref;

  // Preço atual: aria-label="N reais" (robusto) OU __fraction (com ponto de milhar)
  const ariaCur = window.match(
    /poly-price__current[\s\S]{0,400}?aria-label="(\d+(?:\.\d+)?)\s*reais/i,
  );
  let preco = ariaCur ? Number(ariaCur[1].replace(/\./g, "")) : null;
  if (preco == null) {
    const cur = window.match(
      /poly-price__current[\s\S]*?andes-money-amount__fraction[^>]*>([\d.]+)/,
    );
    if (cur) preco = Number(cur[1].replace(/\./g, ""));
  }

  // Preço original: aria-label="Antes: N reais" OU __fraction
  const ariaPrev = window.match(
    /andes-money-amount--previous[\s\S]{0,400}?aria-label="Antes:\s*(\d+(?:\.\d+)?)\s*reais/i,
  );
  let precoOriginal = ariaPrev ? Number(ariaPrev[1].replace(/\./g, "")) : null;
  if (precoOriginal == null) {
    const fp = window.match(
      /andes-money-amount--previous[\s\S]{0,400}?andes-money-amount__fraction[^>]*>([\d.]+)/,
    );
    if (fp) precoOriginal = Number(fp[1].replace(/\./g, ""));
  }

  // Imagem (opcional): primeira webp que contém o MLB_ID
  const imgMatch = [...window.matchAll(/(https?:\/\/http2\.mlstatic\.com\/[^"]+\.webp)/gi)].find(
    (mm) => mm[1].includes(mlbId),
  );
  const imagem = imgMatch
    ? imgMatch[1].replace(/-[A-Z]\.webp(\?.*)?$/i, "-O.webp$1").split("?")[0]
    : null;

  if (preco == null) return null;
  return {
    preco,
    precoOriginal: precoOriginal ?? preco,
    url: rawUrl,
    imagem,
  };
}

/** Aplica ?matt_word=&pid= na URL canônica. */
function applyAffiliate(permalink) {
  try {
    const u = new URL(permalink);
    u.searchParams.set("matt_word", "unidicasofertas");
    u.searchParams.set("pid", "unidicasofertas");
    return u.toString();
  } catch {
    return permalink;
  }
}

/** Limpa a URL: tira params de tracking (pdp_filters, polycard_*, deal_print_id, etc.)
 *  e mantém só o affiliate. Igual ao sync-ofertas-ml.mjs faz com item.permalink. */
function canonicalize(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const TRACKING = [
      "pdp_filters", "polycard_client", "polycard_client_id", "polycard_position",
      "c_element_order", "c_id", "c_label", "c_container_id", "c_global_position",
      "c_element_id", "c_tracking_id", "c_campaign", "c_uid", "deal_print_id",
      "tracking_id", "position", "wid", "sid", "V", "L",
    ];
    for (const k of TRACKING) u.searchParams.delete(k);
    u.hash = "";
    return u.toString();
  } catch {
    return rawUrl;
  }
}

/** Parser tolerante a CRLF/BOM para o MDX. */
function parseMdx(text) {
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
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((x) => x.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    if (val === "true") val = true;
    if (val === "false") val = false;
    fm[m[1]] = val;
  }
  return { fm, body };
}

function renderMdx({ fm, body }, updates) {
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

const files = fs
  .readdirSync(OFERTAS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => path.join(OFERTAS_DIR, f));

// Carrega HTMLs uma vez
const sources = SOURCES.map((s) => ({ name: path.basename(s), html: fs.readFileSync(s, "utf-8") }));

let updated = 0;
let skipped = 0;
let failed = 0;

console.log(`Fontes: ${sources.length}`);
for (const src of sources) console.log(`  - ${src.name}`);

for (const file of files) {
  const text = fs.readFileSync(file, "utf-8");
  const parsed = parseMdx(text);
  if (!parsed) {
    console.warn(`⚠️  ${path.basename(file)} sem frontmatter válido, pulando.`);
    skipped++;
    continue;
  }
  const { fm } = parsed;
  if (!fm.mlbId) {
    console.warn(`⚠️  ${fm.slug} sem mlbId, pulando.`);
    skipped++;
    continue;
  }

  // Procura em cada fonte (na ordem)
  let rec = null;
  let sourceName = null;
  for (const src of sources) {
    rec = extract(src.html, fm.mlbId);
    if (rec) {
      sourceName = src.name;
      break;
    }
  }
  if (!rec) {
    console.log(`⏭️  ${fm.slug} (${fm.mlbId}) — sem fonte, mantém como está`);
    failed++;
    continue;
  }

  const novoPreco = rec.preco;
  const novoPrecoOriginal = rec.precoOriginal;
  const novoLink = applyAffiliate(canonicalize(rec.url));
  const novaImagem = rec.imagem || fm.imagem;

  const diffs = [];
  if (Number(fm.preco) !== novoPreco) diffs.push(`preco ${fm.preco} → ${novoPreco}`);
  if (Number(fm.precoOriginal ?? fm.preco) !== novoPrecoOriginal)
    diffs.push(`precoOriginal ${fm.precoOriginal} → ${novoPrecoOriginal}`);
  if (fm.linkAfiliado !== novoLink) diffs.push("linkAfiliado");
  if (rec.imagem && fm.imagem !== novaImagem) diffs.push("imagem");

  if (diffs.length === 0) {
    console.log(`✓ ${fm.slug} — sem mudança`);
    skipped++;
    continue;
  }

  console.log(`→ ${fm.slug} (${fm.mlbId}) [${sourceName}]`);
  for (const d of diffs) console.log(`    · ${d}`);

  if (!DRY_RUN) {
    const updatedMdx = renderMdx(parsed, {
      preco: novoPreco,
      precoOriginal: novoPrecoOriginal,
      linkAfiliado: novoLink,
      imagem: novaImagem,
    });
    fs.writeFileSync(file, updatedMdx, "utf-8");
  } else {
    console.log("    [dry-run] não escreveu");
  }
  updated++;
}

console.log(`\n=== RESUMO ===`);
console.log(`Atualizados: ${updated}  |  Sem mudança: ${skipped}  |  Sem fonte: ${failed}`);
if (DRY_RUN) console.log("(DRY-RUN: nenhum arquivo foi escrito)");

if (updated > 0 && !DRY_RUN) {
  console.log(`\n→ Próximo passo:  npm run ofertas:db:migrate`);
}
