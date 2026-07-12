#!/usr/bin/env node
/**
 * Linter: garante que nenhum MDX de conteúdo aponta para Unsplash.
 *
 * O projeto padroniza imagens REAIS (foto do produto no marketplace) ou
 * arquivo local em /public. Unsplash é proibido.
 *
 * Uso:
 *   npm run check:images
 *
 * Exit code:
 *   0  → nenhum Unsplash encontrado
 *   1  → encontrou ao menos 1 referência (imprime onde)
 */

import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  "src/content/reviews",
  "src/content/materias",
  "src/content/ofertas",
];

const BANNED_PATTERNS = [
  /images\.unsplash\.com/,
  /unsplash\.com\/photos/,
  /unsplash\.com\/photo-/,  // alguns MDX usam a forma curta
];

const exts = new Set([".mdx", ".md"]);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (exts.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

const files = ROOTS.flatMap((r) => walk(r));
const hits = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf-8");
  for (const pat of BANNED_PATTERNS) {
    const matches = text.match(pat);
    if (matches) {
      const lines = text.split(/\r?\n/);
      const lineNo = lines.findIndex((l) => pat.test(l)) + 1;
      hits.push({ file, line: lineNo, pattern: pat.source, snippet: lines[lineNo - 1]?.trim() });
    }
  }
}

if (hits.length === 0) {
  console.log(`✅  ${files.length} arquivo(s) verificado(s). Nenhuma imagem Unsplash encontrada.`);
  process.exit(0);
}

console.error(`❌  Encontradas ${hits.length} referência(s) a Unsplash:\n`);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}  [${h.pattern}]`);
  console.error(`    ${h.snippet}\n`);
}
console.error("O projeto não usa Unsplash. Substitua por foto real do marketplace (http2.mlstatic.com) ou arquivo local em public/reviews/<slug>.webp.");
process.exit(1);
