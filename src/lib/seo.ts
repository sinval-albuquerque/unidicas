import type { Metadata } from "next";
import type { Review } from "@/types/review";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { obterCategoria } from "@/lib/categorias";

/**
 * Helpers de SEO para geração dinâmica de metadata.
 * Funções puras, testáveis, isoladas do framework de página.
 *
 * Estratégia:
 * - Title: keyword primária à esquerda (peso SEO), modificador de CTR à direita
 * - Description: veredito + preço + desconto + marketplace + ano (freshness)
 * - Open Graph: type=article com publishedTime + tags para rich result
 * - Twitter: summary_large_image com creator do site
 * - Canonical: URL absoluta, sem trailing slash, sem parâmetros
 */

// =====================================================================
// LIMITES SEGUROS DO GOOGLE (2026)
// =====================================================================
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const CURRENT_YEAR = new Date().getFullYear();

// =====================================================================
// HELPERS PRIVADOS
// =====================================================================

/** Trunca sem cortar palavra no meio. */
function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const cortado = texto.slice(0, max - 1);
  const ultimoEspaco = cortado.lastIndexOf(" ");
  return `${cortado.slice(0, ultimoEspaco > 0 ? ultimoEspaco : max - 1)}…`;
}

/** Calcula desconto em % (0 quando sem preço original). */
function calcularDesconto(preco: number, precoOriginal?: number): number {
  if (!precoOriginal || precoOriginal <= preco) return 0;
  return Math.round(((precoOriginal - preco) / precoOriginal) * 100);
}

/** Formata preço em BRL (R$ 1.299,00). */
function fmtPreco(preco: number): string {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** Monta o gancho emocional do título com base na nota. */
function ganchoPorNota(nota: number): string {
  if (nota >= 4.7) return "Vale a pena? Sim!";
  if (nota >= 4.3) return "Vale a pena em";
  if (nota >= 3.8) return "Prós, contras e veredito";
  if (nota >= 3.0) return "Ainda vale a pena em";
  return "Cuidado: veja os contras";
}

// =====================================================================
// CONSTRUTORES DE METADATA
// =====================================================================

/** Title CTR-optimized: keyword primária à esquerda, modificadores à direita. */
export function buildTitle(review: Review): string {
  const categoria = obterCategoria(review.categoria as never);
  const categoriaNome = categoria?.nome ?? "Review";
  const notaStr = `Nota ${review.nota.toFixed(1)}/5`;

  // Título base: "Produto: subtítulo - Nota 4.8/5 (2026) | Categoria - Unidicas"
  // Estrutura: [Primary KW] - [Modifier] | [Brand]
  const base = `${review.produto} review ${CURRENT_YEAR}: ${notaStr} ${ganchoPorNota(review.nota)}`;

  return truncar(`${base} | ${SITE_NAME}`, TITLE_MAX);
}

/** Description com gatilhos de CTR: veredito, preço, desconto, marketplace. */
export function buildDescription(review: Review): string {
  const categoria = obterCategoria(review.categoria as never);
  const categoriaNome = categoria?.nome ?? "produto";
  const desconto = calcularDesconto(review.preco, review.precoOriginal);
  const precoStr = fmtPreco(review.preco);

  // Peças com peso de CTR (em ordem):
  // 1. Veredito direto
  // 2. Preço atual + desconto
  // 3. Marketplace (confiança)
  // 4. Categoria + ano (freshness)
  // 5. CTA emocional
  const partes: string[] = [];

  // 1. Veredito
  if (review.nota >= 4.5) {
    partes.push(`✅ Nota ${review.nota.toFixed(1)}/5 — recomendado`);
  } else if (review.nota >= 3.5) {
    partes.push(`⚖️ Nota ${review.nota.toFixed(1)}/5 — prós e contras reais`);
  } else {
    partes.push(`⚠️ Nota ${review.nota.toFixed(1)}/5 — leia antes de comprar`);
  }

  // 2. Preço + desconto
  if (desconto > 0) {
    partes.push(`${precoStr} (${desconto}% off)`);
  } else {
    partes.push(`a partir de ${precoStr}`);
  }

  // 3. Top 1-2 prós (gatilho de escassez / especificidade)
  if (review.pros.length > 0) {
    const topPro = review.pros[0].toLowerCase();
    partes.push(`destaque: ${topPro}`);
  }

  // 4. Top contra, se existir (sinal de honestidade aumenta CTR)
  if (review.contras.length > 0 && review.nota < 4.5) {
    partes.push(`atenção: ${review.contras[0].toLowerCase()}`);
  }

  // 5. Marketplace + categoria + ano + CTA
  partes.push(`Análise completa ${CURRENT_YEAR} na ${review.marketplace}.`);

  return truncar(partes.join(" • "), DESCRIPTION_MAX);
}

/** Long-tail keywords derivadas de categoria + nota + preço. */
export function buildKeywords(review: Review): string[] {
  const categoria = obterCategoria(review.categoria as never);
  const categoriaNome = categoria?.nome ?? "produto";
  const produto = review.produto;
  const produtoLower = produto.toLowerCase();

  const kws = new Set<string>([
    `${produtoLower} review`,
    `${produtoLower} vale a pena`,
    `${produtoLower} ${CURRENT_YEAR}`,
    `melhor ${categoriaNome.toLowerCase()} ${CURRENT_YEAR}`,
    `${produtoLower} preço`,
    `${produtoLower} prós e contras`,
    `review ${produtoLower}`,
    `${categoriaNome.toLowerCase()} ${CURRENT_YEAR}`,
  ]);

  if (review.nota >= 4.5) {
    kws.add(`melhor ${produtoLower}`);
    kws.add(`${produtoLower} vale a pena comprar`);
  }
  if (review.preco < 2000) {
    kws.add(`${produtoLower} barato`);
    kws.add(`${produtoLower} custo benefício`);
  }

  return Array.from(kws);
}

/** URL canônica absoluta (sem trailing slash, sem query string). */
export function buildCanonical(slug: string): string {
  return `${SITE_URL}/reviews/${slug}`;
}

/** Open Graph completo para compartilhamento em redes sociais. */
export function buildOpenGraph(
  review: Review,
  canonical: string,
): NonNullable<Metadata["openGraph"]> {
  const categoria = obterCategoria(review.categoria as never);
  const desconto = calcularDesconto(review.preco, review.precoOriginal);

  return {
    type: "article",
    url: canonical,
    siteName: SITE_NAME,
    locale: "pt_BR",
    title: `${review.produto}: review completa ${CURRENT_YEAR}`,
    description: buildDescription(review),
    publishedTime: new Date().toISOString(),
    authors: [`Equipe ${SITE_NAME}`],
    section: categoria?.nome ?? "Reviews",
    tags: buildKeywords(review).slice(0, 5),
    images: [
      {
        url: review.imagem,
        width: 1200,
        height: 630,
        alt: review.produto,
        type: "image/jpeg",
      },
    ],
    // OGP não suporta desconto nativamente, mas o título carrega a info
  };
}

/** Twitter Card com creator do site. */
export function buildTwitter(
  review: Review,
  canonical: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    site: "@unidicas",
    creator: "@unidicas",
    title: `${review.produto} — Nota ${review.nota.toFixed(1)}/5`,
    description: buildDescription(review),
    images: [
      {
        url: review.imagem,
        alt: review.produto,
      },
    ],
  };
}

/** Robots para indexação ampla (rich snippet, snippet longo, image preview). */
export function buildRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

/** Alternates (canonical) e formatos. */
export function buildAlternates(canonical: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical,
    languages: {
      "pt-BR": canonical,
    },
  };
}

// =====================================================================
// METADATA COMPLETA
// =====================================================================

/**
 * Monta a Metadata completa de uma review.
 * Use em `generateMetadata()` de qualquer rota dinâmica.
 */
export function buildReviewMetadata(review: Review): Metadata {
  const canonical = buildCanonical(review.slug);

  return {
    title: buildTitle(review),
    description: buildDescription(review),
    keywords: buildKeywords(review),
    authors: [{ name: `Equipe ${SITE_NAME}`, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: obterCategoria(review.categoria as never)?.nome ?? "Reviews",
    classification: "Product Review",
    alternates: buildAlternates(canonical),
    openGraph: buildOpenGraph(review, canonical),
    twitter: buildTwitter(review, canonical),
    robots: buildRobots(),
    other: {
      "article:author": `Equipe ${SITE_NAME}`,
      "article:published_time": new Date().toISOString(),
      "og:price:amount": review.preco.toString(),
      "og:price:currency": "BRL",
      "product:price:amount": review.preco.toString(),
      "product:price:currency": "BRL",
    },
  };
}
