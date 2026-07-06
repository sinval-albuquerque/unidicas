import type { Metadata } from "next";
import Link from "next/link";
import { obterTodasReviews } from "@/lib/reviews";
import { OfertaCard } from "@/components/OfertaCard";
import {
  AFILIADO_ML_PERFIL_URL,
  OFERTAS_FALLBACK_LIMITE,
  OFERTAS_ML_LABEL,
  OFERTAS_ML_LISTA_URL,
} from "@/lib/ofertas";

export const metadata: Metadata = {
  title: "Ofertas em destaque",
  description:
    "Vitrine curada das melhores ofertas — preços baixos, descontos reais e link de afiliado Mercado Livre do Unidicas.",
  alternates: { canonical: "/ofertas" },
  openGraph: {
    title: "Ofertas em destaque — Unidicas",
    description:
      "As melhores ofertas verificadas pelo Unidicas, com link de afiliado Mercado Livre.",
    type: "website",
  },
};

/**
 * Página /ofertas
 *
 * Estratégia em duas camadas:
 *  1. Card no topo abrindo a LPSM curada do Mercado Livre em nova aba
 *     (lista oficial que o usuário pediu).
 *  2. Grade com os produtos que o Unidicas já reviewou e que estão
 *     com desconto, para SEO e para o caso de o iframe/lista ML
 *     estar inacessível.
 */
export default function OfertasPage() {
  const todas = obterTodasReviews();
  const comDesconto = todas
    .filter((r) => r.precoOriginal && r.precoOriginal > r.preco)
    .sort((a, b) => {
      const descA = a.precoOriginal! - a.preco;
      const descB = b.precoOriginal! - b.preco;
      return descB - descA;
    })
    .slice(0, OFERTAS_FALLBACK_LIMITE);

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
          Selecionamos as promoções com o melhor desconto do momento. Os links
          são de afiliado <strong>{OFERTAS_ML_LABEL}</strong> — se você comprar,
          o Unidicas ganha uma pequena comissão, sem custo extra para você.
        </p>
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

      {/* ===== Grade de ofertas (fallback / SEO) ===== */}
      <section>
        <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-text">
              Top descontos do Unidicas
            </h2>
            <p className="text-sm text-text-soft mt-1">
              {comDesconto.length}{" "}
              {comDesconto.length === 1
                ? "oferta selecionada"
                : "ofertas selecionadas"}{" "}
              — em ordem de maior economia.
            </p>
          </div>
          <Link
            href="/produtos"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {comDesconto.length === 0 ? (
          <p className="text-text-soft">
            Nenhuma oferta com desconto no momento. Confira a lista oficial
            do {OFERTAS_ML_LABEL} acima.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {comDesconto.map((review) => (
              <OfertaCard key={review.slug} review={review} />
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
            {OFERTAS_ML_LABEL}
          </a>
          . Ao comprar por eles, o Unidicas recebe uma comissão, sem alterar o
          preço para você.
        </p>
      </footer>
    </div>
  );
}
