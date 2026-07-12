// Extrai produtos de https://www.mercadolivre.com.br/c/ferramentas
// usando o MLB_ID CANÔNICO (do href do produto), não a "variant" (que
// aparece nos preloads de imagem e links de tracking).
//
// Estratégia:
//  1. Pega TODOS os hrefs /<slug>/p/MLB<ID> (MLB canônico) na ordem
//  2. Para cada href, acha o preço DEPOIS do MLB_ID e antes do próximo
//  3. Atribui cada preço ao MLB_ID canônico (o do href)
//
// Uso: node scripts/extrair-ferramentas.mjs [--max=20] [--url=URL]

import fs from "node:fs";
import path from "node:path";

const DEFAULT_URL = "https://www.mercadolivre.com.br/c/ferramentas";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const args = process.argv.slice(2);
const maxArg = args.find((a) => a.startsWith("--max="));
const urlArg = args.find((a) => a.startsWith("--url="));
const MAX = maxArg ? parseInt(maxArg.split("=")[1], 10) : 20;
const URL = urlArg ? urlArg.split("=").slice(1).join("=") : DEFAULT_URL;

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
console.log(`HTML: ${html.length} bytes  (${URL})`);

function deslugify(slug) {
  return String(slug)
    .split("-")
    .map((w) => {
      if (/^\d/.test(w) || (w.length <= 3 && /[a-z]/.test(w))) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

// 1. Pega todos os hrefs canônicos (MLB_ID = canônico do produto)
const linkRegex = /href="https?:\/\/(?:www\.)?mercadolivre\.com\.br\/[a-z0-9-]+\/(?:p|sec)\/(MLB\d{8,})[^"]*"/g;
const links = [...html.matchAll(linkRegex)].map((m) => ({ id: m[1], idx: m.index }));
console.log(`hrefs canônicos: ${links.length}`);

// 2. Pega todas as frações e centavos na ordem
const fracAll = [
  ...html.matchAll(/andes-money-amount__fraction[^>]*>(\d+)/g),
].map((m) => ({ val: parseInt(m[1], 10), idx: m.index }));
const centsAll = [
  ...html.matchAll(/andes-money-amount__cents[^>]*>(\d+)/g),
].map((m) => ({ val: parseInt(m[1], 10), idx: m.index }));

// 3. Para cada link canônico, acha o preço DEPOIS dele
const products = [];
const seen = new Set();
for (let i = 0; i < links.length; i++) {
  const cur = links[i];
  if (seen.has(cur.id)) continue;

  const next = links[i + 1];
  const lo = cur.idx;
  const hi = next ? next.idx : html.length;

  // Fração DEPOIS do MLB_ID atual
  const frac = fracAll.find((f) => f.idx > lo && f.idx < hi);
  if (!frac) continue;

  // Centavo (opcional) próximo
  const cents = centsAll.find(
    (c) => c.idx > lo && c.idx < hi && Math.abs(c.idx - frac.idx) < 500,
  );
  const precoFinal = cents ? frac.val + cents.val / 100 : frac.val;

  // Imagem
  const img = [
    ...html.slice(lo, hi).matchAll(/(https?:\/\/http2\.mlstatic\.com\/[^"]+\.webp)/gi),
  ]
    .map((m) => m[1])
    .find((u) => u.includes(cur.id));
  const imagem = img ? img.replace(/-[A-Z]\.webp$/i, "-O.webp") : null;

  // Slug: vem do href canônico que estamos processando (não do contexto anterior)
  const ownHref = html.slice(lo, lo + 1500).match(
    /href="https?:\/\/(?:www\.)?mercadolivre\.com\.br\/([a-z0-9-]+)\/(?:p|sec)\//,
  );
  // Fallback: procura em qualquer ponto próximo
  const ctxSlug = html.slice(Math.max(0, lo - 100), lo + 500).match(
    /mercadolivre\.com\.br\/([a-z0-9-]+)\/(?:p|sec)\/MLB\d{8,}/,
  );
  const rawSlug = ownHref?.[1] || ctxSlug?.[1] || cur.id.toLowerCase();
  const slug = rawSlug;
  const titulo = deslugify(slug);

  products.push({
    mlbId: cur.id,
    slug,
    titulo,
    preco: precoFinal,
    url: `https://www.mercadolivre.com.br/${slug}/p/${cur.id}`,
    imagem,
  });
  seen.add(cur.id);
}

console.log(`Produtos canônicos com preço: ${products.length}`);

const sample = products.slice(0, MAX);
const blocks = sample.map((p) => {
  const cleanSlug = p.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return [
    `slug: ${cleanSlug}`,
    `mlbId: ${p.mlbId}`,
    `titulo: "${p.titulo.replace(/"/g, '\\"')}"`,
    `produto: "${p.titulo.replace(/"/g, '\\"')}"`,
    `categoria: ferramentas`,
    `preco: ${p.preco}`,
    `precoOriginal: ${p.preco}`,
    `imagem: ${p.imagem || ""}`,
    `marketplace: Mercado Livre`,
    `url: ${p.url}`,
    `emDestaque: false`,
    `nota: 4.5`,
    `tags: [Mais Vendido, Frete Grátis]`,
    `resumo: "Encontrado na seção de ferramentas do Mercado Livre. Edite o resumo."`,
  ].join("\n");
});

const header = `# Extraído automaticamente de ${URL}
# Data: ${new Date().toISOString()}
# Total extraído: ${sample.length} de ${products.length} produtos com preço
#
# Próximo passo: revise os blocos abaixo (título, preço, slug) e rode:
#   npm run ofertas:ingest
#   npm run ofertas:db:migrate
# ----------------------------------------------------------------------------
`;

const out = header + blocks.join("\n---\n") + "\n---\n";
const dest = path.join(process.cwd(), "ofertas-input.txt");
fs.writeFileSync(dest, out, "utf-8");
console.log(`Gravado: ${dest}  (${out.length} bytes, ${sample.length} blocos)`);

console.log("\nAmostra (primeiro bloco):");
console.log(blocks[0]);

console.log("\nTodos os preços extraídos:");
for (const p of products) {
  console.log(`  ${p.mlbId}  R$ ${p.preco.toFixed(2)}  ${p.slug}`);
}
