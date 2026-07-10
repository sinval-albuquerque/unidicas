// Adiciona mlbId no frontmatter de todos os MDXs que ainda nao tem,
// extraindo do linkAfiliado via regex ML(B|U)\d+.
// Uso: node scripts/add-mlb-id.mjs

import fs from "node:fs";
import path from "node:path";

const DIRS = ["src/content/reviews", "src/content/ofertas"];
// Aceita MLB (produto principal) e MLBU (variacao / "up"). A API do ML
// (/items/MLBU_xxx) funciona para os dois formatos.
const ML_ID_REGEX = /ML(BU?)(\d+)/i;

let adicionados = 0;
let existentes = 0;
let semLink = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(dir, f));

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");

    if (/^mlbId:\s*"?ML(BU?)[-]?\d+"?/im.test(original)) {
      existentes++;
      continue;
    }

    const linkMatch = original.match(/linkAfiliado:\s*"([^"]+)"/);
    if (!linkMatch) {
      semLink++;
      console.log(`[SKIP] ${path.basename(file)}: sem linkAfiliado`);
      continue;
    }
    const mlbMatch = linkMatch[1].match(ML_ID_REGEX);
    if (!mlbMatch) {
      semLink++;
      console.log(`[SKIP] ${path.basename(file)}: link sem ML ID`);
      continue;
    }

    const mlbId = `ML${mlbMatch[1].toUpperCase()}${mlbMatch[2]}`;

    const novo = original.replace(
      /^(slug:[^\n]*)\n/m,
      `$1\nmlbId: "${mlbId}"\n`,
      1,
    );

    if (novo !== original) {
      fs.writeFileSync(file, novo, "utf8");
      adicionados++;
      console.log(`[OK] ${path.basename(file)}: ${mlbId}`);
    } else {
      console.log(`[ERRO] ${path.basename(file)}: slug nao encontrado`);
    }
  }
}

console.log("\n============================================");
console.log(`  Adicionados:    ${adicionados}`);
console.log(`  Ja existentes:  ${existentes}`);
console.log(`  Sem link ML:    ${semLink}`);
console.log("============================================");

