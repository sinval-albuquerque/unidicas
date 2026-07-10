// Terceira passada: corrige o que sobrou da passada anterior.
// A passada 2 trocou "â€\u201D" (3 chars) por "\u201D" (aspas curly), mas
// o uso real era em-dash "—". Refaz com a logica correta.
//
// Tambem faz uma varredura final para eliminar soft hyphens e
// caracteres de controle invisiveis.
//
// Uso: node scripts/fix-mojibake-3.mjs

import fs from "node:fs";
import path from "node:path";

const DIRS = ["src/content/reviews", "src/content/ofertas", "src/content/materias"];

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

    // 1) "”" (right double quote, U+201D) que aparece entre palavras
    //    (precedido e seguido por letra/numero) -> em-dash " — "
    //    Isso pega o caso "Soundcore P30i Anker ” 49% OFF" onde o
    //    ” deveria ser —
    novo = novo.replace(
      /(\S)\u201D(\s)/g,
      (_m, antes, depois) => {
        countArquivo++;
        return `${antes} —${depois}`;
      },
    );
    // E o caso onde tem espaco antes tambem: " $" ou " 49" antes
    novo = novo.replace(
      /(\s)\u201D(\s)/g,
      (_m, antes, depois) => {
        countArquivo++;
        return `${antes}—${depois}`;
      },
    );

    // 2) Remove qualquer soft hyphen remanescente
    const shMatches = novo.match(/\u00AD/g);
    if (shMatches) {
      countArquivo += shMatches.length;
      novo = novo.replaceAll("\u00AD", "");
    }

    // 3) "„" (double low-9 quotation mark) sozinho entre palavras -> aspas curly
    //    nao troca nada aqui por seguranca.

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
