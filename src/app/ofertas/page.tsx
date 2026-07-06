import type { Metadata } from "next";
import Link from "next/link";
import { obterTodasReviews } from "@/lib/reviews";
import { OfertaCard } from "@/components/OfertaCard";
import { MlOfertaCard } from "@/components/MlOfertaCard";
import {
  AFILIADO_ML_PERFIL_URL,
  OFERTAS_ML_LABEL,
  OFERTAS_ML_LISTA_URL,
} from "@/lib/ofertas";
import { buscarOfertasML, ML_AFFILIATE_NICK_PUBLIC } from "@/lib/ml";

/**
 * Página /ofertas — Server Component dinâmico.
 *
 * - Faz até 3 buscas paralelas na API pública do ML (categorias amplas).
 * - Cacheia por 1h (revalidate=3600).
 * - Se a API falhar (403, timeout, sem rede), cai para o fallback
 *   com reviews já existentes no Unidicas.
 *
 * Isso replica o padrão do Promobit: dados renderizados no servidor,
 * hidratação client, e fallback gracioso.
 */

export const revalidate = 3600; // 1h — equivalente ao que o Promobit faz

export const metadata: Metadata = {
  title: "Ofertas em destaque",
  description:
    "Ofertas verificadas do Mercado Livre via Unidicas — descontos em informática, celulares, casa e mais. Link de afiliado.",
  alternates: { canonical: "/ofertas" },
  openGraph: {
    title: "Ofertas em destaque — Unidicas",
    description:
      "As melhores ofertas verificadas pelo Unidicas, com link de afiliado Mercado Livre.",
    type: "website",
  },
};

export default async function OfertasPage() {
  // Busca paralela nas 3 maiores categorias do nosso escopo.
  // Cada chamada é independente — se uma falhar, as outras ainda aparecem.
  const [resInformatica, resCelulares, resCasa] = await Promise.allSettled([
    buscarOfertasML({ query: "promocao", categoryId: "MLB1648", limit: 8 }),
    buscarOfertasML({ query: "promocao", categoryId: "MLB1051", limit: 8 }),
    buscarOfertasML({ query: "promocao", categoryId: "MLB1574", limit: 8 }),
  ]);

  // Junta resultados com sucesso e deduplica por ID.
  const seen = new Set<string>();
  const mlItems = [
    resInformatica,
    resCelulares,
    resCasa,
  ].flatMap((r) => (r.status === "fulfilled" ? r.value.results : []))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 12);

  // Erros por categoria (para mostrar debug só em dev).
  const erros = [resInformatica, resCelulares, resCasa]
    .map((r, i) => ({
      cat: ["Informática", "Celulares", "Casa"][i],
      msg: r.status === "rejected" ? String(r.reason) : r.value.error?.message,
    }))
    .filter((e) => e.msg);

  const mlFalhou = mlItems.length === 0;

  // Fallback: reviews locais com desconto.
  const reviews = mlFalhou
    ? obterTodasReviews()
        .filter((r) => r.precoOriginal && r.precoOriginal > r.preco)
        .sort((a, b) => b.nota - a.nota)
        .slice(0, 12)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ===== Hero da página ===== */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-extrabold mb-2">
          🔥 Ofertas em destaque
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          As melhores ofertas verificadas
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          Selecionamos as promoções com o melhor desconto do momento em{" "}
          <strong>{OFERTAS_ML_LABEL}</strong>. Os links são de afiliado — se
          você comprar, o Unidicas ganha uma pequena comissão, sem custo
          extra para você.
        </p>
        {mlFalhou && (
          <div className="mt-4 bg-accent-soft border border-accent/30 rounded-lg px-4 py-3 text-sm">
            <strong>Modo de contingência ativo:</strong> a API do Mercado
            Livre não respondeu agora. Mostrando as últimas ofertas
            curadas pelo Unidicas. Tente recarregar em alguns minutos.
          </div>
        )}
      </header>

      {/* ===== Card "Abrir lista oficial" ===== */}
      <a
        href={OFERTAS_ML_LISTA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-bg-alt border-2 border-accent rounded-2xl p-6 md:p-8 mb-10 no-underline hover:bg-accent-soft transition"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block bg-accent text-black text-[0.7rem] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider mb-2">
              Lista oficial
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-text group-hover:text-primary transition">
              Ver a vitrine completa no {OFERTAS_ML_LABEL}
            </h2>
            <p className="text-sm text-text-soft mt-1 max-w-xl">
              Abre a lista curada de produtos com desconto. Atualizada pelo
              Mercado Livre.
            </p>
          </div>
          <span className="self-start md:self-center inline-flex items-center gap-2 bg-accent text-black font-extrabold text-sm px-5 py-3 rounded-lg group-hover:bg-accent/90 transition shrink-0">
            Abrir lista
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 12 L12 4 M5 4 H12 V11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </a>

      {/* ===== Grade: ML API ou fallback ===== */}
      <section>
        <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-text">
              {mlFalhou
                ? "Top descontos do Unidicas"
                : `Ofertas de hoje no ${OFERTAS_ML_LABEL}`}
            </h2>
            <p className="text-sm text-text-soft mt-1">
              {mlFalhou
                ? "12 reviews selecionados — em ordem de maior economia."
                : `${mlItems.length} ${
                    mlItems.length === 1 ? "oferta" : "ofertas"
                  } com pelo menos 20% de desconto — atualizado a cada 1h.`}
            </p>
          </div>
          <Link
            href="/produtos"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {mlFalhou ? (
          reviews.length === 0 ? (
            <p className="text-text-soft">
              Nenhuma oferta com desconto no momento. Confira a lista
              oficial do {OFERTAS_ML_LABEL} acima.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {reviews.map((review) => (
                <OfertaCard key={review.slug} review={review} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mlItems.map((item) => (
              <MlOfertaCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Rodapé de transparência ===== */}
      <footer className="mt-12 pt-6 border-t border-border text-sm text-text-soft">
        <p>
          <strong>Transparência:</strong> este site usa links de afiliado{" "}
          <a
            href={AFILIADO_ML_PERFIL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline"
          >
            {OFERTAS_ML_LABEL} ({ML_AFFILIATE_NICK_PUBLIC})
          </a>
          . Ao comprar por eles, o Unidicas recebe uma comissão, sem
          alterar o preço para você.
        </p>
        {process.env.NODE_ENV === "development" && erros.length > 0 && (
          <details className="mt-3 text-xs text-text-muted">
            <summary className="cursor-pointer">
              Debug: {erros.length} chamada(s) com erro
            </summary>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {erros.map((e, i) => (
                <li key={i}>
                  {e.cat}: {e.msg}
                </li>
              ))}
            </ul>
          </details>
        )}
      </footer>
    </div>
  );
}
