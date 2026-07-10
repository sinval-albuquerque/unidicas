// Segunda passada de correcao de mojibake em MDX.
// Padroes comuns de LLM/editores mal-comportantes:
//   "â€"" (3 chars) -> " (aspas duplas curly)
//   "â€˜"           -> ' (aspas simples curly)
//   "â€""           -> " (right double quote)
//   "â€”"           -> — (em-dash)
//   "â€“"           -> – (en-dash)
//   "â€¦"           -> … (ellipsis)
//   "Â "            ->   (espaco nao-quebrancavel U+00A0)
//   "â€" + char     -> variantes quebradas de curly quotes
//
// Tambem remove qualquer outro caractere de controle invisivel.
//
// Uso: node scripts/fix-mojibake-2.mjs

import fs from "node:fs";
import path from "node:path";

const DIRS = ["src/content/reviews", "src/content/ofertas", "src/content/materias"];

const SUBSTITUICOES = [
  // em-dash / en-dash / ellipsis
  ["â€\u2014", "—"],
  ["â€\u2013", "–"],
  ["â€\u2026", "…"],
  // aspas curly (HTML entities mal-decodificadas)
  ["â€\u201C", "“"],
  ["â€\u201D", "”"],
  ["â€\u2018", "‘"],
  ["â€\u2019", "’"],
  // espaco nao-quebrancavel
  ["Â ", " "],
  // separador usado em varios MDXs do projeto (sugestao: manter)
  // ["â€”", " — "],
  // bullet point
  ["â€¢", "•"],
  // copyright / trademark
  ["Â©", "©"],
  ["Â®", "®"],
  ["Â¢", "¢"],
  // qualquer variante de "â€" solta (3-byte UTF-8 quebrado) -> remove
  ["â€", '"'],
];

let totalArquivos = 0;
let totalSubstituicoes = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(dir, f));

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    let novo = original;
    let countArquivo = 0;

    for (const [de, para] of SUBSTITUICOES) {
      const matches = novo.match(new RegExp(de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
      if (matches) {
        countArquivo += matches.length;
        novo = novo.replaceAll(de, para);
      }
    }

    if (novo !== original) {
      fs.writeFileSync(file, novo, "utf8");
      totalArquivos++;
      totalSubstituicoes += countArquivo;
      console.log(`[OK] ${path.basename(file)}: ${countArquivo} substituicoes`);
    }
  }
}

console.log("\n============================================");
console.log(`  Arquivos corrigidos:    ${totalArquivos}`);
console.log(`  Total de substituicoes: ${totalSubstituicoes}`);
console.log("============================================");
