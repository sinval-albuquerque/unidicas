/**
 * Scraper ao vivo de preços — Mercado Livre + Amazon.
 *
 * Funciona como dispatcher: para cada oferta, detecta o marketplace
 * e chama o scraping adequado.
 *
 * Mercado Livre:
 *   A página `/c/ofertas` do ML é ACESSÍVEL de qualquer IP.
 *   Extrai preços da listagem HTML.
 *
 * Amazon:
 *   Usa a PA-API oficial (Product Advertising API) com Signature v4.
 *   Requer env vars: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG.
 *   Se não configurada, retorna Map vazio (fallback silencioso).
 */

import { obterPrecosAmazon } from "./amazon-paapi";
import type { Oferta } from "@/types/oferta";

export interface PrecoScraped {
  preco: number;
  precoOriginal: number | null;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const ML_LISTING_URLS = [
  "https://www.mercadolivre.com.br/c/ofertas",
  "https://www.mercadolivre.com.br/c/ferramentas",
  "https://www.mercadolivre.com.br/c/celulares",
];

// =====================================================================
// SCRAPING MERCADO LIVRE
// =====================================================================

async function scrapingML(
  mlbIds: string[],
): Promise<Map<string, PrecoScraped>> {
  const resultado = new Map<string, PrecoScraped>();
  if (mlbIds.length === 0) return resultado;

  let html: string | null = null;
  for (const url of ML_LISTING_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        next: { revalidate: 120 },
      });
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch {
      // Tenta próxima URL
    }
  }

  if (!html) return resultado;

  for (const mlbId of mlbIds) {
    const p = extrairPrecoML(html, mlbId);
    if (p) resultado.set(mlbId, p);
  }

  return resultado;
}

function extrairPrecoML(html: string, mlbId: string): PrecoScraped | null {
  // Escape mlbId para evitar ReDoS
  const escapedId = mlbId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hrefRe = new RegExp(
    `href="(https?://(?:www\\.)?mercadolivre\\.com\\.br/[a-z0-9-]+/p/${escapedId}[^"]{0,500})"`,
  );
  const m = html.match(hrefRe);
  if (!m) return null;

  const url = m[1];
  const idx = m.index!;
  const tail = html.slice(idx, idx + 4000);
  const afterHref = tail.slice(url.length);
  const stopRe = /href="https?:\/\/(?:www\.)?mercadolivre\.com\.br\/[a-z0-9-]+\/p\//g;
  const stopMatch = stopRe.exec(afterHref);
  const window = stopMatch ? afterHref.slice(0, stopMatch.index) : afterHref;

  const ariaCur = window.match(
    /poly-price__current[\s\S]{0,400}?aria-label="(\d+(?:\.\d+)?)\s*reais/i,
  );
  let preco: number | null = ariaCur
    ? Number(ariaCur[1].replace(/\./g, ""))
    : null;
  if (preco == null) {
    const cur = window.match(
      /poly-price__current[\s\S]*?andes-money-amount__fraction[^>]*>([\d.]+)/,
    );
    if (cur) preco = Number(cur[1].replace(/\./g, ""));
  }
  if (preco == null) return null;

  const ariaPrev = window.match(
    /andes-money-amount--previous[\s\S]{0,400}?aria-label="Antes:\s*(\d+(?:\.\d+)?)\s*reais/i,
  );
  let precoOriginal: number | null = ariaPrev
    ? Number(ariaPrev[1].replace(/\./g, ""))
    : null;
  if (precoOriginal == null) {
    const fp = window.match(
      /andes-money-amount--previous[\s\S]{0,400}?andes-money-amount__fraction[^>]*>([\d.]+)/,
    );
    if (fp) precoOriginal = Number(fp[1].replace(/\./g, ""));
  }

  return { preco, precoOriginal };
}

// =====================================================================
// FUNÇÃO PRINCIPAL — DISPATCHER
// =====================================================================

/**
 * Busca preços atualizados de todas as ofertas, roteando por marketplace.
 *
 * @param ofertas Lista de ofertas para verificar preços
 * @returns Map<id, PrecoScraped> — id é mlbId para ML, asin para Amazon
 */
export async function scrapingPrecosLive(
  ofertas: Oferta[],
): Promise<Map<string, PrecoScraped>> {
  const resultado = new Map<string, PrecoScraped>();

  // Separa por marketplace
  const mlOfertas = ofertas.filter(
    (o) =>
      o.marketplace?.toLowerCase().includes("mercado livre") ||
      o.marketplace?.toLowerCase() === "mercadolivre" ||
      o.marketplace?.toLowerCase() === "ml",
  );
  const amazonOfertas = ofertas.filter((o) =>
    o.marketplace?.toLowerCase().includes("amazon"),
  );

  const mlbIds = mlOfertas
    .map((o) => o.mlbId)
    .filter((id): id is string => Boolean(id));

  const asins = amazonOfertas
    .map((o) => o.asin)
    .filter((id): id is string => Boolean(id));

  // Executa em paralelo
  const [mlPrecos, amazonPrecos] = await Promise.all([
    scrapingML(mlbIds),
    obterPrecosAmazon(asins),
  ]);

  for (const [id, preco] of mlPrecos) resultado.set(id, preco);
  for (const [id, preco] of amazonPrecos) resultado.set(id, preco);

  return resultado;
}
