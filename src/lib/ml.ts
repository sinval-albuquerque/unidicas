/**
 * Cliente tipado para a API pública do Mercado Livre.
 *
 * Documentação: https://developers.mercadolivre.com.br/pt-br/itens-e-buscas
 *
 * Por que este arquivo existe?
 * - Centraliza o shape da resposta (que é enorme) num subconjunto que usamos.
 * - Centraliza o link de afiliação (parâmetros `matt_word` + `pid`).
 * - Aplica timeout e tratamento de erro uniformes.
 *
 * IMPORTANTE — Afiliação:
 * O ML identifica o afiliado por cookie de sessão, configurado quando o
 * usuário clica num link com `?matt_word=SEU_NICK`. O link que geramos
 * preserva o `permalink` original do produto (que é a URL canônica no ML)
 * e adiciona APENAS os parâmetros de tracking — sem redirecionar, sem
 * encurtar. Isso é o que o programa de afiliados exige.
 *
 * IMPORTANTE — Cache:
 * A API do ML pode ser bloqueada por IP/região. A página que consome
 * este módulo (src/app/ofertas/page.tsx) usa revalidate=3600 e tem um
 * fallback com reviews locais — então se a chamada falhar, o site não
 * quebra.
 */

const ML_AFFILIATE_NICK = "sinvalalbuquerque";
const ML_USER_AGENT =
  "Mozilla/5.0 (compatible; UnidicasBot/1.0; +https://unidicas.com.br)";
const ML_FETCH_TIMEOUT_MS = 8000;

/** Categorias do ML Brasil (MLB) — usadas opcionalmente para refinar busca. */
export const ML_CATEGORIES: Record<string, string> = {
  MLB1648: "Informática",
  MLB1051: "Celulares e Telefones",
  MLB1276: "Esportes e Fitness",
  MLB1574: "Casa, Móveis e Decoração",
  MLB1132: "Brinquedos e Hobbies",
  MLB5726: "Eletrodomésticos",
  MLB1430: "Moda e Acessórios",
};

/** Termo de busca padrão — usado quando a LPSM não pode ser extraída. */
const ML_DEFAULT_QUERY = "promocao desconto";

/* ===========================================================================
   Types — subconjunto da resposta de /sites/MLB/search que nos interessa
   =========================================================================== */

export interface MlItem {
  id: string;
  title: string;
  price: number;
  /** Preço original antes do desconto, se houver. */
  originalPrice: number | null;
  /** % de desconto calculado a partir de price/originalPrice. */
  discountPercent: number | null;
  permalink: string;
  thumbnail: string;
  categoryId: string | null;
  freeShipping: boolean;
  /** Link final com seu tag de afiliação. */
  affiliateUrl: string;
}

export interface MlSearchResponse {
  results: MlItem[];
  total: number;
  /** Quando a chamada falhou (timeout, 403, etc.), esse objeto vem com o motivo. */
  error: { message: string } | null;
}

/* ===========================================================================
   Helpers
   =========================================================================== */

/**
 * Adiciona os parâmetros oficiais de tracking do programa de afiliados ML.
 *
 * Doc: `matt_word` é o nick do afiliado. `pid` é opcional e identifica o
 * canal (usamos o domínio do site).
 */
function withAffiliate(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("matt_word", ML_AFFILIATE_NICK);
    u.searchParams.set("pid", ML_AFFILIATE_NICK);
    return u.toString();
  } catch {
    return url;
  }
}

/** Faz fetch com timeout via AbortController. */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": ML_USER_AGENT,
        Accept: "application/json",
      },
      signal: ctrl.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

/* ===========================================================================
   API pública
   =========================================================================== */

export interface SearchMlOptions {
  /** Termo de busca. Default: 'promocao desconto'. */
  query?: string;
  /** ID de categoria MLB (ex.: MLB1648). Opcional. */
  categoryId?: string;
  /** Limite de itens. Default: 12, máx: 50. */
  limit?: number;
}

/**
 * Busca itens com desconto na API pública do ML.
 *
 * Retorna `MlSearchResponse` com `error` populado em caso de falha — nunca
 * joga exceção. Quem consome decide se mostra fallback ou estado vazio.
 */
export async function buscarOfertasML(
  options: SearchMlOptions = {},
): Promise<MlSearchResponse> {
  const query = options.query ?? ML_DEFAULT_QUERY;
  const limit = Math.min(50, Math.max(1, options.limit ?? 12));

  // A API exige o filtro de desconto para trazer só promoções.
  // `discount=20-100` = 20% a 100% off.
  const params = new URLSearchParams({
    q: query,
    condition: "new",
    discount: "20-100",
    sort: "price_asc",
    limit: String(limit),
  });
  if (options.categoryId) params.set("category", options.categoryId);

  const url = `https://api.mercadolibre.com/sites/MLB/search?${params.toString()}`;

  try {
    const res = await fetchWithTimeout(url, ML_FETCH_TIMEOUT_MS);

    if (!res.ok) {
      return {
        results: [],
        total: 0,
        error: { message: `ML API respondeu HTTP ${res.status}` },
      };
    }

    const data = (await res.json()) as {
      results?: Array<Record<string, unknown>>;
      paging?: { total?: number };
    };

    const results: MlItem[] = (data.results ?? []).map((raw) => {
      const id = String(raw.id ?? "");
      const title = String(raw.title ?? "");
      const price = Number(raw.price ?? 0);
      const originalPrice =
        typeof raw.original_price === "number" && raw.original_price > price
          ? Number(raw.original_price)
          : null;
      const discountPercent =
        originalPrice && originalPrice > 0
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : null;
      const permalink = String(raw.permalink ?? "");
      const thumbnail = String(raw.thumbnail ?? raw.secure_thumbnail ?? "");

      const shipping = raw.shipping as { free_shipping?: boolean } | undefined;
      const freeShipping = Boolean(shipping?.free_shipping);

      const categoryId = Array.isArray(raw.category_id)
        ? String(raw.category_id[0] ?? "")
        : raw.category_id
          ? String(raw.category_id)
          : null;

      return {
        id,
        title,
        price,
        originalPrice,
        discountPercent,
        permalink,
        thumbnail,
        categoryId,
        freeShipping,
        affiliateUrl: permalink ? withAffiliate(permalink) : "",
      };
    });

    return {
      results,
      total: data.paging?.total ?? results.length,
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido ao buscar ML";
    return {
      results: [],
      total: 0,
      error: { message },
    };
  }
}

/** Helper que retorna só o nick — útil para textos da UI. */
export const ML_AFFILIATE_NICK_PUBLIC = ML_AFFILIATE_NICK;
