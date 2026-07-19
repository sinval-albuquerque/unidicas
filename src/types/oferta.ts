/**
 * Modelo de uma oferta curada manualmente.
 *
 * Diferente de Review (que é editorial): Oferta é uma vitrine rápida —
 * você controla 100% dos dados, sem depender de API externa.
 *
 * O `linkAfiliado` deve ser a URL canônica do produto no ML já com
 * o parâmetro `?matt_word=unidicasofertas` para rastreamento.
 *
 * Vantagens sobre scraping/API:
 * - 100% confiável (não quebra)
 * - Sem risco de ban do programa de afiliados
 * - Você escolhe o que destacar
 */
export interface OfertaFrontmatter {
  /** Slug único, kebab-case. Ex.: "notebook-gamer-5499". */
  slug: string;
  /** Título do produto (usado em cards e na página). */
  titulo: string;
  /** Nome curto do produto (usado em `alt` de imagens). */
  produto: string;
  /** Categoria para filtrar (notebooks, celulares, fones, etc.). */
  categoria: string;
  /** ID do produto no Mercado Livre (MLB...). Ex.: "MLB66895633". */
  mlbId?: string;
  /** ASIN do produto na Amazon. Ex.: "B0CCZ26B5K". */
  asin?: string;
  /** Preço atual em R$ (com desconto, se houver). */
  preco: number;
  /** Preço original antes do desconto. Opcional. */
  precoOriginal?: number;
  /** URL da imagem do produto. */
  imagem: string;
  /** Marketplace (Mercado Livre, Amazon, etc.). */
  marketplace: string;
  /** Link de afiliado — OBRIGATÓRIO conter `?matt_word=unidicasofertas`. */
  linkAfiliado: string;
  /** Cupom de desconto, se houver. */
  cupom?: string;
  /** Data de expiração da oferta (ISO). Opcional. */
  expiraEm?: string;
  /** Badges extras (ex.: "Frete Grátis", "Prime"). */
  tags?: string[];
  /** true = aparece em destaque na home. */
  emDestaque?: boolean;
  /** Nota média do produto (0–5). Opcional — usada no card da Home. */
  nota?: number;
  /** Resumo curto (1 linha) para cards compactos. */
  resumo: string;
  /**
   * Data ISO (YYYY-MM-DD) em que o preço foi verificado pela última vez
   * contra a página do produto no marketplace. Opcional, mas se ausente
   * o card mostra um aviso de preço possivelmente desatualizado.
   *
   * Mantido pelo `sync-ofertas-ml.mjs` (API) ou pelo extrator de HTML.
   */
  verificadoEm?: string;
}

export interface Oferta extends OfertaFrontmatter {
  /** Conteúdo MDX (opcional — pode ser só um callout com CTA). */
  conteudo: string;
}
