/**
 * Centraliza as URLs canônicas usadas pela página de Ofertas.
 * Trocar aqui propaga para Header (desktop + mobile) e para a página.
 */

/**
 * Link da lista curada no Mercado Livre (LPSM LiquidA).
 * É a "vitrine" principal que o usuário quer abrir dentro do site.
 */
export const OFERTAS_ML_LISTA_URL =
  "https://lista.mercadolivre.com.br/_Container_lpsm-liquida-7-7-descontaco?forceContainer=true#origin=ads";

/**
 * Perfil de afiliado Mercado Livre do autor.
 * Usado como origem nos links externos de produto.
 */
export const AFILIADO_ML_PERFIL_URL =
  "https://www.mercadolivre.com.br/social/unidicasofertas";

/** Mercado Livre (para destacar a fonte). */
export const OFERTAS_ML_LABEL = "Mercado Livre";

/** Quantas ofertas exibir na grade fallback. */
export const OFERTAS_FALLBACK_LIMITE = 12;

// =====================================================================
// AMAZON
// =====================================================================

/** Amazon Associates Tracking ID. */
export const AMAZON_ASSOCIATE_TAG =
  process.env.AMAZON_ASSOCIATE_TAG ?? "unidicas-20";

/** URL do perfil de afiliado Amazon. */
export const AFILIADO_AMAZON_URL = `https://www.amazon.com.br/shop/${AMAZON_ASSOCIATE_TAG}`;

/** Label genérico para Amazon. */
export const OFERTAS_AMAZON_LABEL = "Amazon";
