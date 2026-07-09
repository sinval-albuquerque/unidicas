import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { obterTodasReviews } from "@/lib/reviews";
import { obterTodasOfertas } from "@/lib/ofertas-content";
import { HeroOfertaRotativa } from "./HeroOfertaRotativa";
import {
  JANELA_ROTACAO_MS,
  selecionarOfertaRotativa,
} from "@/lib/oferta-rotativa";

/** Hero da home — moderno, com gradiente, stats ao vivo e CTAs duplos. */
export function Hero() {
  const totalReviews = obterTodasReviews().length;
  const totalOfertas = obterTodasOfertas().length;

  // Pool de ofertas candidatas ao card rotativo da Home.
  // Prioridade: ofertas marcadas com `emDestaque: true`.
  // Fallback: todas as ofertas com desconto (precoOriginal > preco),
  // ordenadas por maior desconto absoluto (já vem de `obterTodasOfertas`).
  const todas = obterTodasOfertas();
  const destaque = todas.filter((o) => o.emDestaque);
  const comDesconto = todas.filter(
    (o) => o.precoOriginal && o.precoOriginal > o.preco,
  );
  const pool = destaque.length > 0 ? destaque : comDesconto;

  // Oferta "atual" segundo a janela de 30min — calculada de forma
  // determinística no servidor para casar com o primeiro tick do client.
  const agora = Date.now();
  const ofertaDestaque =
    selecionarOfertaRotativa(pool, agora, JANELA_ROTACAO_MS) ?? null;

  return (
    <section className="relative overflow-hidden bg-mesh-hero">
      {/* Glow blob decorativo */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl float"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl float"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", animationDelay: "2s" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Texto */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-bg/80 border border-border backdrop-blur-sm rounded-full px-3 py-1.5 mb-6 text-xs font-semibold text-text-soft shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span>{totalOfertas} ofertas atualizadas agora</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Compre certo,
              <br />
              <span className="gradient-text">sem perder tempo.</span>
            </h1>

            <p className="text-lg md:text-xl text-text-soft leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Reviews honestas, comparativos detalhados e link direto para a
              melhor oferta — tudo em um só lugar.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-xl no-underline transition shadow-glow-primary hover:scale-[1.02]"
              >
                Ver reviews
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/ofertas"
                className="inline-flex items-center gap-2 bg-bg hover:bg-bg-alt border border-border text-text font-semibold px-5 py-3 rounded-xl no-underline transition hover:border-accent hover:shadow-soft"
              >
                <span className="text-base" aria-hidden>🔥</span>
                Ofertas do dia
              </Link>
            </div>

            {/* Stats inline */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8 text-sm">
              <div>
                <p className="text-2xl font-extrabold text-text">{totalReviews}+</p>
                <p className="text-text-muted text-xs uppercase tracking-wider">Reviews</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-extrabold text-text">{CATEGORIAS.length}</p>
                <p className="text-text-muted text-xs uppercase tracking-wider">Categorias</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-extrabold text-text">{totalOfertas}</p>
                <p className="text-text-muted text-xs uppercase tracking-wider">Ofertas ativas</p>
              </div>
            </div>
          </div>

          {/* Card flutuante decorativo — oferta rotativa (a cada 30 min) */}
          <HeroOfertaRotativa pool={pool} fallback={ofertaDestaque} />
        </div>

        {/* Categorias pills */}
        <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-2">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="bg-bg/80 hover:bg-bg border border-border text-text-soft hover:border-primary hover:text-primary text-sm font-medium px-4 py-2 rounded-full no-underline transition backdrop-blur-sm hover:shadow-soft"
            >
              {c.nome}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
