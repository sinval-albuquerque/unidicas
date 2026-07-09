import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { ReviewCard } from "@/components/ReviewCard";
import { AffiliateCta } from "@/components/AffiliateCta";
import { ProductCallout } from "@/components/ProductCallout";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductList } from "@/components/ProductList";
import { ProTip, Warning, Cite } from "@/components/ProTip";
import { RatingBadge } from "@/components/RatingBadge";
import {
  obterReviewPorSlug,
  obterTodasReviews,
  obterReviewsPorCategoria,
} from "@/lib/reviews";
import { obterCategoria } from "@/lib/categorias";
import { obterSecao } from "@/lib/secoes";
import { EXTERNAL_LINK_REL, SITE_NAME } from "@/lib/constants";

export function generateStaticParams() {
  return obterTodasReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = obterReviewPorSlug(slug);
  if (!review) return { title: "Review não encontrada" };
  return {
    title: `${review.titulo} - Review ${review.nota}/5`,
    description: review.resumo,
  };
}

function tempoLeitura(texto: string): number {
  const palavras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palavras / 200));
}

export default async function ReviewSinglePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = obterReviewPorSlug(slug);
  if (!review) return notFound();

  const categoria = obterCategoria(review.categoria as never);
  const secao = categoria ? obterSecao(categoria.secao) : undefined;
  const desconto = review.precoOriginal
    ? Math.round(
        ((review.precoOriginal - review.preco) / review.precoOriginal) * 100,
      )
    : 0;
  const tempo = tempoLeitura(review.conteudo);

  const relacionados = obterReviewsPorCategoria(review.categoria)
    .filter((r) => r.slug !== review.slug)
    .slice(0, 3);

  const compiled = await compileMDX({
    source: review.conteudo,
    components: {
      ProductCallout,
      ProductGrid,
      ProductList,
      ProTip,
      Warning,
      Cite,
    },
  });

  return (
    <article className="bg-bg">
      {/* =================================================================
          BARRA DE SESSAO + BREADCRUMB
         ================================================================= */}
      <div className="border-b border-border bg-bg-alt">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-text-soft overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary no-underline shrink-0">
            {SITE_NAME}
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          <Link href="/reviews" className="hover:text-primary no-underline shrink-0">
            Reviews
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          {categoria && secao && (
            <>
              <Link
                href={`/secoes/${secao.slug}`}
                className="hover:text-primary no-underline shrink-0"
                style={{ color: secao.cor }}
              >
                {secao.nome}
              </Link>
              <span className="text-text-muted shrink-0">/</span>
              <Link
                href={`/categorias/${categoria.slug}`}
                className="hover:text-primary no-underline shrink-0"
              >
                {categoria.nome}
              </Link>
              <span className="text-text-muted shrink-0">/</span>
            </>
          )}
          <span className="text-text truncate">{review.titulo}</span>
        </div>
      </div>

      {/* =================================================================
          HEADER DA REVIEW
         ================================================================= */}
      <header className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {categoria && secao && (
            <span
              className="inline-flex items-center gap-1 text-[0.7rem] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                color: secao.cor,
                backgroundColor: secao.corLight,
                borderColor: secao.cor,
              }}
            >
              {secao.icone && <span aria-hidden>{secao.icone}</span>}
              {categoria.nome}
            </span>
          )}
          {review.emDestaque && (
            <span className="inline-flex items-center gap-1 bg-accent text-bg-dark text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ★ Destaque
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-bg-alt border border-border text-text-soft text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {review.marketplace}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-text mb-6">
          {review.titulo}
        </h1>

        <p className="text-lg md:text-xl text-text-soft leading-relaxed max-w-3xl mb-8">
          {review.resumo}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-text-soft">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-extrabold text-sm">
              U
            </div>
            <div>
              <p className="font-semibold text-text leading-tight">Equipe {SITE_NAME}</p>
              <p className="text-xs text-text-muted">Review independente</p>
            </div>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <div className="flex items-center gap-2">
            <RatingBadge nota={review.nota} />
            <span className="text-xs text-text-muted">/ 5</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <span className="uppercase tracking-wider text-xs font-semibold text-text-muted">
            {tempo} min de leitura
          </span>
        </div>
      </header>

      {/* =================================================================
          IMAGEM DESTAQUE
         ================================================================= */}
      <figure className="max-w-6xl mx-auto px-4 mb-12">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-bg-gray shadow-floating">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.imagem}
            alt={review.produto}
            className="w-full h-full object-cover"
          />
        </div>
      </figure>

      {/* =================================================================
          CONTEUDO (2 colunas) + SIDEBAR
         ================================================================= */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 min-w-0">
            <div className="prose-article">{compiled.content}</div>

            {/* ===================================================================
                CTA DE AFILIADO — FINAL DA REVIEW (full-width, destaque maximo)
               =================================================================== */}
            <div className="mt-12 not-prose">
              <AffiliateCta
                variant="primary"
                titulo="Aproveite esta oferta"
                subtitulo="Garantimos o melhor preço encontrado para esta seleção."
                href={review.linkAfiliado}
                ctaLabel="Ir para a oferta"
                produto={review.produto}
                preco={review.preco}
                precoOriginal={review.precoOriginal}
                marketplace={review.marketplace}
                imagem={review.imagem}
              />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              {/* SIDEBAR: FICHA TECNICA + CTA COMPACTO */}
              <div className="bg-bg border border-border rounded-2xl p-5 shadow-elevated">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
                  Ficha técnica
                </p>
                <p className="text-base font-extrabold text-text mb-1 leading-tight">
                  {review.produto}
                </p>
                <p className="text-xs text-text-muted mb-4">
                  {review.marketplace}
                </p>

                <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-border">
                  <span className="text-2xl font-extrabold text-primary">
                    R$ {review.preco.toLocaleString("pt-BR")}
                  </span>
                  {review.precoOriginal && (
                    <span className="text-xs text-text-muted line-through">
                      R$ {review.precoOriginal.toLocaleString("pt-BR")}
                    </span>
                  )}
                  {desconto > 0 && (
                    <span className="ml-auto bg-danger text-white text-xs font-extrabold px-2 py-1 rounded-md">
                      -{desconto}%
                    </span>
                  )}
                </div>

                <a
                  href={review.linkAfiliado}
                  target="_blank"
                  rel={EXTERNAL_LINK_REL}
                  className="block text-center bg-accent hover:bg-accent/90 text-bg-dark font-extrabold py-3 rounded-xl no-underline transition shadow-soft hover:shadow-elevated"
                >
                  Ver oferta →
                </a>
                <p className="text-[0.65rem] text-text-muted text-center mt-2">
                  Link de afiliado
                </p>
              </div>

              {/* RELACIONADOS */}
              {relacionados.length > 0 && (
                <div className="mt-8 bg-bg-alt border border-border rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-soft mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Outras reviews
                  </h3>
                  <ul className="space-y-4">
                    {relacionados.map((r) => (
                      <li key={r.slug} className="flex gap-3 group">
                        <Link
                          href={`/reviews/${r.slug}`}
                          className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-bg-gray"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.imagem}
                            alt=""
                            className="w-full h-full object-cover transition group-hover:scale-110"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:text-primary transition">
                            <Link
                              href={`/reviews/${r.slug}`}
                              className="text-text no-underline"
                            >
                              {r.titulo}
                            </Link>
                          </h4>
                          <p className="text-xs text-text-muted mt-1">
                            Nota {r.nota.toFixed(1)} • R$ {r.preco.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* =================================================================
          REVIEWS RELACIONADAS (full width)
         ================================================================= */}
      {relacionados.length > 0 && (
        <section className="border-t border-border bg-bg-alt py-14">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-primary rounded-full" />
              Outras reviews de {categoria?.nome ?? "produtos"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relacionados.map((r) => (
                <ReviewCard key={r.slug} review={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
