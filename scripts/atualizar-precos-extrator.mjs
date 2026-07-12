// Lê ofertas-input.txt e atualiza in-place os MDX em src/content/ofertas/
// com o preço correto, URL canônica e título do extrator.
//
// Não cria arquivos novos: só atualiza os MDX existentes cujo mlbId bate
// com algum bloco do input. Se o mlbId não existe no MDX, pula.
//
// Uso: node scripts/atualizar-precos-extrator.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "ofertas-input.txt");
const OFERTAS_DIR = path.join(ROOT, "src", "content", "ofertas");

const DRY_RUN = process.argv.includes("--dry-run");

function parseInput(text) {
  // Remove linhas de comentário (# …) e a linha horizontal (# ----)
  // ANTES de split por "\n---\n" — senão o "# ----" casa com o regex.
  const cleaned = text
    .split("\n")
    .filter((l) => !/^#/.test(l))
    .join("\n");
  const blocks = cleaned
    .split(/\n---\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
  const parsed = blocks.map((block) => {
    const obj = {};
    for (const line of block.split("\n")) {
      const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Array inline: [a, b, c] ou [Mais Vendido, Frete Grátis]
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map((x) => x.trim().replace(/^["']|["']$/g, ""))
          .filter((x) => x.length > 0);
      }
      // booleans
      if (val === "true") val = true;
      if (val === "false") val = false;
      obj[m[1]] = val;
    }
    return obj;
  });
  return parsed.filter((o) => o.mlbId);
}

/** Parser tolerante a BOM/CRLF para os MDX existentes. */
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
    // Array inline: [a, b, c]
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((x) => x.trim().replace(/^["']|["']$/g, ""))
        .filter((x) => x.length > 0);
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

/** Anexa ?matt_word=&pid= na URL canônica. */
function applyAffiliate(permalink) {
  if (!permalink) return null;
  try {
    const u = new URL(permalink);
    u.searchParams.set("matt_word", "unidicasofertas");
    u.searchParams.set("pid", "unidicasofertas");
    return u.toString();
  } catch {
    return permalink;
  }
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`❌  ${INPUT} não existe. Rode:  node scripts/extrair-ferramentas.mjs`);
    process.exit(1);
  }
  const text = fs.readFileSync(INPUT, "utf-8");
  const updates = parseInput(text);
  console.log(`Blocos no input: ${updates.length}`);

  // Indexa por mlbId
  const byMlb = new Map();
  for (const o of updates) byMlb.set(o.mlbId, o);

  const files = fs
    .readdirSync(OFERTAS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(OFERTAS_DIR, f));

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const text = fs.readFileSync(file, "utf-8");
    const parsed = parseMdx(text);
    if (!parsed) continue;
    const { fm } = parsed;
    if (!fm.mlbId) continue;

    const upd = byMlb.get(fm.mlbId);
    if (!upd) {
      skipped++;
      continue;
    }

    const novoPreco = Number(upd.preco);
    const novoLink = applyAffiliate(upd.url);
    const novoTitulo = upd.titulo;
    const novoProduto = upd.titulo;
    const diffs = [];
    if (Number(fm.preco) !== novoPreco) diffs.push(`preco ${fm.preco} -> ${novoPreco}`);
    if (fm.linkAfiliado !== novoLink) diffs.push("linkAfiliado");
    if (fm.titulo !== novoTitulo) diffs.push("titulo");

    if (diffs.length === 0) continue;

    process.stdout.write(`→ ${fm.slug} (${fm.mlbId}) … `);
    console.log(`atualizado (${diffs.join(", ")})`);

    const updatedMdx = renderMdx(parsed, {
      preco: novoPreco,
      precoOriginal: novoPreco,
      linkAfiliado: novoLink,
      titulo: novoTitulo,
      produto: novoProduto,
    });
    if (!DRY_RUN) {
      fs.writeFileSync(file, updatedMdx, "utf-8");
    }
    updated++;
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`MDX atualizados: ${updated}  |  Sem match no input: ${skipped}`);
  if (DRY_RUN) console.log("(DRY-RUN: nenhum arquivo foi escrito)");

  if (updated > 0 && !DRY_RUN) {
    console.log(`\n→ Próximo passo:  npm run ofertas:db:migrate`);
  }
}

main();
