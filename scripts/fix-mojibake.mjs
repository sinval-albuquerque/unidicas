// Corrige mojibake UTF-8/Latin-1 em todos os arquivos MDX do projeto.
//
// Problema: alguns MDXs tem "Ã©", "Ã§", etc. no lugar de "é", "ç" e
// tambem soft hyphens (0xC2 0xAD) que vieram de um editor que salvou
// o conteudo como Latin-1 mas os bytes estao em UTF-8.
//
// Uso: node scripts/fix-mojibake.mjs

import fs from "node:fs";
import path from "node:path";

const DIRS = ["src/content/reviews", "src/content/ofertas", "src/content/materias"];

// Substitui pares de bytes UTF-8 que representam um caractere Latin-1
// (C0..FF + 80..BF) de volta ao caractere UTF-8 correto.
// Ex.: "Ã©" (UTF-8 de "Ã©" visto como Latin-1) -> "é"
function decodeMojibake(text) {
  return text.replace(/[\u00C2\u00C3][\u0080-\u00BF]/g, (seq) => {
    const a = seq.charCodeAt(0) & 0x1f; // mascara 0xE0 -> primeiros 5 bits
    const b = seq.charCodeAt(1) & 0x3f; // mascara 0xC0 -> ultimos 6 bits
    // a e b juntos formam o codepoint UTF-8 do caractere Latin-1 original
    const codePoint = (a << 6) | b;
    return String.fromCodePoint(codePoint);
  });
}

// Remove soft hyphens (U+00AD) que foram parar no texto.
function removeSoftHyphen(text) {
  return text.replace(/\u00AD/g, "");
}

// Mantem aspas tipograficas consistentes (so se ja existirem em
// Latin-1 errado, nao substitui aspas normais).
function fixCurlyQuotes(text) {
  // nao fazer nada por enquanto — preserva aspas originais
  return text;
}

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

    // conta mojibake antes
    const antes = (original.match(/[\u00C2\u00C3][\u0080-\u00BF]/g) || []).length;
    const antesHyphen = (original.match(/\u00AD/g) || []).length;

    novo = decodeMojibake(novo);
    novo = removeSoftHyphen(novo);
    novo = fixCurlyQuotes(novo);

    if (novo !== original) {
      fs.writeFileSync(file, novo, "utf8");
      totalArquivos++;
      totalSubstituicoes += antes + antesHyphen;
      console.log(
        `[OK] ${path.basename(file)}: ${antes} mojibake + ${antesHyphen} soft-hyphen`,
      );
    }
  }
}

console.log("\n============================================");
console.log(`  Arquivos corrigidos:    ${totalArquivos}`);
console.log(`  Total de substituicoes: ${totalSubstituicoes}`);
console.log("============================================");
