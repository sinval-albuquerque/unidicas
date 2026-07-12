// Extrai produtos de https://www.mercadolivre.com.br/c/ferramentas
// e gera blocos YAML em ofertas-input.txt.
//
// O ML bloqueia 403 a chamada de /items/{id}, mas a página /c/ferramentas
// renderiza server-side com todos os produtos. Cada card tem:
//   - link /p/MLBxxx ou /sec/MLBxxx  -> MLB_ID
//   - <h2> com o título
//   - <span class="andes-money-amount__fraction"> com o preço
//   - <img> com a imagem (data-src ou src)
// O scraping é best-effort: pode falhar em alguns cards (ML muda HTML).
//
// Uso: node scripts/extrair-ferramentas.mjs [--max=20]

import fs from "node:fs";
import path from "node:path";

const URL = "https://www.mercadolivre.com.br/c/ferramentas";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const args = process.argv.slice(2);
const maxArg = args.find((a) => a.startsWith("--max="));
const MAX = maxArg ? parseInt(maxArg.split("=")[1], 10) : 20;

const res = await fetch(URL, {
  headers: {
    "User-Agent": UA,
    Accept: "text/html,application/xhtml+xml",
    "Accept-Language": "pt-BR,pt;q=0.9",
  },
});

if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  process.exit(1);
}

const html = await res.text();
console.log(`HTML: ${html.length} bytes`);

// Converte slug "lavadora-de-alta-presso-krcher-compacta-1500psi-1400w"
// em "Lavadora De Alta Presso Krcher Compacta 1500psi 1400w".
function deslugify(slug) {
  return String(slug)
    .split("-")
    .map((w) => {
      if (/^\d/.test(w) || (w.length <= 3 && /[a-z]/.test(w))) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

// Estratégia: o HTML de /c/ferramentas tem cards com links canônicos no
// formato  https://www.mercadolivre.com.br/<slug>/p/MLB<ID>
// (ou /sec/MLB<ID>). Pega cada link e extrai do contexto (3000 chars) o
// título, preço e imagem.
const linkRegex = /https?:\/\/(?:www\.)?mercadolivre\.com\.br\/[a-z0-9-]+\/(?:p|sec)\/(MLB\d{8,})/gi;
const seen = new Set();
const products = [];

let match;
while ((match = linkRegex.exec(html)) !== null) {
  const productUrl = match[0];
  const mlbId = match[1];
  if (seen.has(mlbId)) continue;
  seen.add(mlbId);

  const start = Math.max(0, match.index - 3000);
  const end = Math.min(html.length, match.index + 3000);
  const ctx = html.slice(start, end);

  // Slug da URL vira título (fallback confiável)
  const slugFromUrl = productUrl.match(
    /mercadolivre\.com\.br\/([a-z0-9-]+)\/(?:p|sec)\//,
  );
  let titulo = slugFromUrl ? deslugify(slugFromUrl[1]) : null;

  // Tenta pegar título melhor via h2/h3 do card
  const titleMatch = ctx.match(/<h[23][^>]*>([^<]{8,180})<\/h[23]>/);
  if (titleMatch && titleMatch[1].length > (titulo?.length ?? 0)) {
    titulo = titleMatch[1]
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (!titulo) titulo = `Produto ${mlbId}`;

  // Preço
  const inteiroMatch = ctx.match(/andes-money-amount__fraction[^>]*>(\d+)/);
  if (!inteiroMatch) continue;
  const centavosMatch = ctx.match(/andes-money-amount__cents[^>]*>(\d+)/);
  const preco = parseInt(inteiroMatch[1], 10);
  const centavos = centavosMatch ? parseInt(centavosMatch[1], 10) : 0;
  const precoFinal = centavos > 0 ? preco + centavos / 100 : preco;

  // Preço original: se houver mais de um valor no card, o maior é o cheio
  const precos = [
    ...ctx.matchAll(/andes-money-amount__fraction[^>]*>(\d+)/g),
  ].map((x) => parseInt(x[1], 10));
  const precoOriginal = precos.length > 1 ? Math.max(...precos) : precoFinal;

  // Imagem: primeira URL http2.mlstatic com o MLB_ID
  const imgRegex = new RegExp(`(https?://http2\\.mlstatic\\.com/[^"]+${mlbId}[^"]+\\.webp)`, "gi");
  let imagem =
    [...ctx.matchAll(imgRegex)]
      .map((x) => x[1])[0] ||
    [...ctx.matchAll(/(https?:\/\/http2\.mlstatic\.com\/[^"]+\.webp)/gi)]
      .map((x) => x[1])[0];
  if (imagem) imagem = imagem.replace(/-[A-Z]\.webp$/i, "-O.webp");

  products.push({
    mlbId,
    titulo,
    preco: precoFinal,
    precoOriginal,
    url: productUrl.split("?")[0],
    imagem,
  });
}

console.log(`Extraídos: ${products.length} produtos únicos`);
const sample = products.slice(0, MAX);

// Gera YAML no formato do ofertas-input.txt
const blocks = sample.map((p) => {
  const slug = p.titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return [
    `slug: ${slug}`,
    `titulo: "${p.titulo.replace(/"/g, '\\"')}"`,
    `produto: "${p.titulo.replace(/"/g, '\\"')}"`,
    `categoria: ferramentas`,
    `preco: ${p.preco}`,
    `precoOriginal: ${p.preco}`,
    `imagem: ${p.imagem}`,
    `marketplace: Mercado Livre`,
    `url: ${p.url}`,
    `emDestaque: false`,
    `nota: 4.5`,
    `tags: [Mais Vendido, Frete Grátis]`,
    `resumo: "Encontrado na seção de ferramentas do Mercado Livre."`,
  ].join("\n");
});

const header = `# Extraído automaticamente em ${new Date().toISOString()}
# Fonte: ${URL}
# Total extraído: ${sample.length} de ${products.length}
# Pipeline: rode  npm run ofertas:ingest
# ----------------------------------------------------------------------------
`;

const out = header + blocks.join("\n---\n") + "\n---\n";
const dest = path.join(process.cwd(), "ofertas-input.txt");
fs.writeFileSync(dest, out, "utf-8");

console.log(`Gravado: ${dest}  (${out.length} bytes, ${sample.length} blocos)`);
console.log("\nPrimeiro bloco de exemplo:");
console.log(blocks[0]);
