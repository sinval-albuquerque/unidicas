/**
 * Constantes centrais do Unidicas.
 * Evita magic strings/numbers espalhados pelo código.
 */

export const SITE_NAME = "Unidicas";

/** URL canônica do site (domínio registrado). */
export const SITE_URL = "https://unidicas.com.br";

export const SITE_DESCRIPTION =
  "Dicas e comparativos de produtos para você escolher com mais confiança.";

/** Atributos rel="..." corretos para links externos (SEO + segurança). */
export const EXTERNAL_LINK_REL = "noopener noreferrer";

/** Marketplaces suportados (para validação/normalização). */
export const MARKETPLACES = [
  "Amazon",
  "Mercado Livre",
  "Shopee",
  "Magalu",
  "AliExpress",
] as const;

export type Marketplace = (typeof MARKETPLACES)[number];