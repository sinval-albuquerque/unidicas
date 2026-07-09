import type { Metadata } from "next";
import Link from "next/link";
import { OfertaCuratedCard } from "@/components/OfertaCuratedCard";
import { OfertaCard } from "@/components/OfertaCard";
import { obterTodasOfertas } from "@/lib/ofertas-content";
import { obterTodasReviews } from "@/lib/reviews";
import {
  AFILIADO_ML_PERFIL_URL,
  OFERTAS_ML_LABEL,
  OFERTAS_ML_LISTA_URL,
} from "@/lib/ofertas";

/**
 * Página /ofertas
 *
 * Fonte primária: ofertas curadas manualmente em `src/content/ofertas/*.mdx`.
 * Cada oferta tem link de afiliado com `?matt_word=unidicasofertas` —
 * rastreamento oficial do programa de afiliados do Mercado Livre.
 *
 * Fonte secundária (fallback): reviews do Unidicas com desconto ativo.
 *
 * Por que não usar a API do Mercado Livre?
 * O ML fechou todos os endpoints de search/trends/highlights para IPs de
 * datacenter (incluindo AWS/Vercel) em 2025. Tentamos:
 *  - /sites/MLB/search       → 403 PolicyAgent
 *  - /trends/MLB             → 403
 *  - /highlights/MLB         → 403
 *  - lista.mercadolivre.com.br (LPSM) → account-verification anti-bot
 * Solução: curadoria manual = 100% confiável, sem risco de ban.
 */

export const metadata: Metadata = {
  title: "Ofertas em destaque",
  description:
    "Ofertas curadas com link de afiliado Mercado Livre (Unidicas) — descontos verificados e rastreados.",
  alternates: { canonical: "/ofertas" },
  openGraph: {
    title: "Ofertas em destaque — Unidicas",
    description:
      "As melhores ofertas verificadas pelo Unidicas, com link de afiliado Mercado Livre.",
    type: "website",
  },
};

export default function OfertasPage() {
  const ofertasCuradas = obterTodasOfertas();
  const reviews = obterTodasReviews()
    .filter((r) => r.precoOriginal && r.precoOriginal > r.preco)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ===== Hero ===== */}
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

      {/* ===== Ofertas curadas (primário) ===== */}
      {ofertasCuradas.length > 0 && (
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-text">
                Ofertas curadas
              </h2>
              <p className="text-sm text-text-soft mt-1">
                {ofertasCuradas.length}{" "}
                {ofertasCuradas.length === 1
                  ? "oferta selecionada"
                  : "ofertas selecionadas"}{" "}
                — atualizadas manualmente pelo Unidicas.
              </p>
            </div>
            <span className="text-[0.7rem] text-text-muted uppercase tracking-wider font-bold">
              {ofertasCuradas.filter((o) => o.emDestaque).length} em destaque
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ofertasCuradas.map((oferta) => (
              <OfertaCuratedCard key={oferta.slug} oferta={oferta} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Fallback: reviews com desconto ===== */}
      {reviews.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-text">
                Reviews do Unidicas com desconto
              </h2>
              <p className="text-sm text-text-soft mt-1">
                Produtos que já avaliamos e que estão com promoção ativa.
              </p>
            </div>
            <Link
              href="/produtos"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {reviews.map((review) => (
              <OfertaCard key={review.slug} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Vazio (nunca deve acontecer, mas defensivo) ===== */}
      {ofertasCuradas.length === 0 && reviews.length === 0 && (
        <p className="text-text-soft">
          Nenhuma oferta no momento. Confira a lista oficial do{" "}
          {OFERTAS_ML_LABEL} acima.
        </p>
      )}

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
            {OFERTAS_ML_LABEL} (unidicasofertas)
          </a>
          . Ao comprar por eles, o Unidicas recebe uma comissão, sem
          alterar o preço para você.
        </p>
      </footer>
    </div>
  );
}
