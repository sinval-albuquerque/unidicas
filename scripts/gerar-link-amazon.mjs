#!/usr/bin/env node
/**
 * Gera link de afiliado da Amazon automaticamente.
 *
 * Aceita URL canônica da Amazon ou ASIN direto.
 *
 * Uso:
 *   node scripts/gerar-link-amazon.mjs "https://www.amazon.com.br/dp/B0B1C2D3E4"
 *   node scripts/gerar-link-amazon.mjs "B0B1C2D3E4"
 *   node scripts/gerar-link-amazon.mjs    # modo interativo
 */

const TAG = process.env.AMAZON_ASSOCIATE_TAG || "unidicas-20";

function extrairAsin(input) {
  // ASIN direto (10 caracteres, começa com B)?
  const asinMatch = input.trim().match(/^([A-Z0-9]{10})$/);
  if (asinMatch) return asinMatch[1];

  // URL da Amazon
  try {
    const url = new URL(input);
    // /dp/ASIN
    const dp = url.pathname.match(/\/dp\/([A-Z0-9]{10})/);
    if (dp) return dp[1];
    // /gp/product/ASIN
    const gp = url.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
    if (gp) return gp[1];
    // /exec/obidos/ASIN
    const exec = url.pathname.match(/\/exec\/obidos\/([A-Z0-9]{10})/);
    if (exec) return exec[1];
  } catch {
    // URL inválida
  }

  return null;
}

function gerarLink(asin) {
  return `https://www.amazon.com.br/dp/${asin}?tag=${TAG}&ref=nosim`;
}

// --- CLI ---
const input = process.argv[2];

if (input) {
  const asin = extrairAsin(input);
  if (!asin) {
    console.error(
      "\n❌  Não foi possível extrair o ASIN.");
    console.error("   Forneça uma URL da Amazon (ex: https://www.amazon.com.br/dp/B0CCZ26B5K)");
    console.error("   ou um ASIN de 10 caracteres (ex: B0CCZ26B5K).\n");
    process.exit(1);
  }
  console.log(`\n🔗  Link de afiliado gerado:\n   ${gerarLink(asin)}\n`);
} else {
  // Modo interativo
  process.stdout.write("\nCole a URL da Amazon ou o ASIN: ");
  process.stdin.once("data", (buf) => {
    const answer = buf.toString().trim();
    const asin = extrairAsin(answer);
    if (!asin) {
      console.error("❌  ASIN inválido.");
      process.exit(1);
    }
    console.log(`\n🔗  Link de afiliado gerado:\n   ${gerarLink(asin)}\n`);
    process.exit(0);
  });
}
