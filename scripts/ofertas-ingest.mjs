#!/usr/bin/env node
/**
 * Lê `ofertas-input.txt` (YAML simples por bloco, separado por `---`) e gera
 * arquivos `src/content/ofertas/<slug>.mdx` prontos pra migração.
 *
 * Por que existe:
 *   - O ML bloqueia scraping de qualquer IP (até residencial, em 2026).
 *   - Você cola os dados no `ofertas-input.txt` e este script aplica:
 *     1. Extrai o MLB_ID da URL
 *     2. Anexa ?matt_word=unidicasofertas&pid=unidicasofertas
 *     3. Faz upgrade da imagem para -O.jpg (original, sem limite)
 *     4. Slug automático a partir do campo `slug:` (ou do título)
 *     5. Escreve o MDX no padrão de src/content/ofertas/*.mdx
 *
 * Uso:
 *   1. Preencha `ofertas-input.txt` (vide exemplo no topo do arquivo)
 *   2. `npm run ofertas:ingest`
 *   3. (opcional) `npm run ofertas:db:migrate` para subir pro Supabase
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "ofertas-input.txt");
const OUT_DIR = path.join(ROOT, "src", "content", "ofertas");

const MATT_WORD = "unidicasofertas";
const MATT_TOOL = "unidicasofertas";

/** Slug rápido: aceita letras, números, hífen. Força minúsculas. */
function slugify(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extrai o MLB_ID de qualquer URL do ML. Retorna null se não achar. */
function extractMlbId(url) {
  const m = String(url).match(/MLB\d{8,}/);
  return m ? m[0] : null;
}

/**
 * Faz upgrade de thumb do ML para o sufixo `-O.webp` (tamanho original, sem limite):
 *   /D_NQ_NP_2X_XXX-MLA...-F.webp  -> /D_NQ_NP_2X_XXX-MLA...-O.webp
 *   /D_Q_NP_2X_XXX-MLA...-AB.webp  -> /D_Q_NP_2X_XXX-MLA...-O.webp
 * Se não casar, devolve o original sem modificação.
 */
function upgradeMlImage(url) {
  return String(url).replace(/-[A-Z]\.webp$/i, "-O.webp");
}

/** Anexa/replace `?matt_word=&pid=` no link de afiliado. */
function applyAffiliate(url) {
  const u = new URL(url);
  u.searchParams.set("matt_word", MATT_WORD);
  u.searchParams.set("pid", MATT_TOOL);
  return u.toString();
}

/** Parse mínimo: cada bloco é separado por linha `---` no início. */
function parseBlocks(text) {
  // Quebra em blocos por `---` (linha inteira, com ou sem espaços).
  const blocks = text
    .split(/\n-{3,}\s*\n/g)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return blocks
    .map((block) => {
      const obj = {};
      for (const line of block.split("\n")) {
        // Pula comentários (# …) e linhas vazias.
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        // Sem flag m: $ é fim-de-string, mas cada `line` aqui já é 1 linha só,
        // então funciona. PROBLEMA: em CRLF o `\r` antes do `\n` faz o
        // (.*) consumir o `\r`, e o $ não casa. Solução: flag m.
        const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/m);
        if (!m) continue;
        const key = m[1];
        let val = m[2].trim();
        // Tira aspas se tiver
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Arrays em YAML simples
        if (val.startsWith("[") && val.endsWith("]")) {
          val = val
            .slice(1, -1)
            .split(",")
            .map((x) => x.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        }
        // booleans
        if (val === "true") val = true;
        if (val === "false") val = false;
        obj[key] = val;
      }
      return obj;
    })
    // Descarta blocos vazios ou só com comentários
    .filter((obj) => Object.keys(obj).length > 0);
}

/** Renderiza o frontmatter em YAML estável. */
function renderMdx(o) {
  const slug = o.slug || slugify(o.titulo || "");
  if (!slug) throw new Error("Bloco sem slug nem titulo");

  const mlbId = extractMlbId(o.url || "") || o.mlbId || "";
  const link = applyAffiliate(o.url || "");
  const imagem = upgradeMlImage(o.imagem || "");

  const fmtList = (v) =>
    Array.isArray(v) ? `[${v.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(", ")}]` : "[]";

  const fmtNum = (v) => (v == null || v === "" ? "0" : String(Number(v)));

  return `---
slug: "${slug}"
${mlbId ? `mlbId: "${mlbId}"\n` : ""}titulo: "${String(o.titulo || "").replace(/"/g, '\\"')}"
produto: "${String(o.produto || o.titulo || "").replace(/"/g, '\\"')}"
categoria: "${o.categoria || "outros"}"
preco: ${fmtNum(o.preco)}
precoOriginal: ${fmtNum(o.precoOriginal || o.preco)}
imagem: "${imagem}"
marketplace: "${o.marketplace || "Mercado Livre"}"
linkAfiliado: "${link}"
tags: ${fmtList(o.tags || [])}
emDestaque: ${o.emDestaque ? "true" : "false"}
nota: ${o.nota ?? "null"}
resumo: "${String(o.resumo || "").replace(/"/g, '\\"')}"
---

## Por que essa oferta vale a pena

${o.resumo || "(resumo pendente — edite este MDX)."}

<ProTip>
  Pagando no **Pix** o desconto pode ser maior. Compare com a concorrência antes
  de finalizar — a maioria cobra acima desse preço.
</ProTip>

[👉 Pegar oferta no Mercado Livre](${link})
`;
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`❌  Arquivo não encontrado: ${INPUT_PATH}`);
    console.error("    Crie-o a partir de scripts/oferas-input.example.txt");
    process.exit(1);
  }

  const text = fs.readFileSync(INPUT_PATH, "utf-8");
  const blocks = parseBlocks(text);
  if (blocks.length === 0) {
    console.error("❌  Nenhum bloco encontrado em ofertas-input.txt");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const created = [];
  const skipped = [];

  for (const o of blocks) {
    if (!o.url) {
      console.warn(`⚠️  Bloco sem url, pulando: ${JSON.stringify(o).slice(0, 80)}…`);
      skipped.push(o);
      continue;
    }
    const slug = o.slug || slugify(o.titulo || "");
    if (!slug) {
      console.warn(`⚠️  Bloco sem slug/titulo, pulando: ${JSON.stringify(o).slice(0, 80)}…`);
      skipped.push(o);
      continue;
    }
    const mdx = renderMdx(o);
    const dest = path.join(OUT_DIR, `${slug}.mdx`);
    if (fs.existsSync(dest)) {
      console.warn(`⚠️  Já existe: ${slug}.mdx — pulando (apague o arquivo se quiser sobrescrever)`);
      skipped.push(o);
      continue;
    }
    fs.writeFileSync(dest, mdx, "utf-8");
    created.push(slug);
    console.log(`✅  ${slug}.mdx`);
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Criados: ${created.length}  |  Pulados: ${skipped.length}`);
  console.log(`\nPróximos passos:`);
  console.log(`  1. Revise os MDX em src/content/ofertas/`);
  console.log(`  2. npm run ofertas:db:migrate    # sobe pro Supabase`);
}

main();
