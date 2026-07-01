import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { Sidebar } from "@/components/Sidebar";
import { ReviewCard } from "@/components/ReviewCard";
import { RatingBadge } from "@/components/RatingBadge";
import { ProductCallout } from "@/components/ProductCallout";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductList } from "@/components/ProductList";
import { ProTip, Warning, Cite } from "@/components/ProTip";
import {
  obterReviewPorSlug,
  obterTodasReviews,
  obterReviewsPorCategoria,
} from "@/lib/reviews";
import { obterCategoria } from "@/lib/categorias";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

export function generateStaticParams() {
  return obterTodasReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const review = obterReviewPorSlug(params.slug);
  if (!review) return { title: "Review não encontrada" };
  return {
    title: review.titulo,
    description: review.resumo,
  };
}

/** Página de uma review: cabeçalho, ficha técnica, prós/contras, conteúdo, relacionados. */
export default async function ReviewSinglePage({
  params,
}: {
  params: { slug: string };
}) {
  const review = obterReviewPorSlug(params.slug);
  if (!review) return notFound();

  const categoria = obterCategoria(review.categoria);
  const desconto = review.precoOriginal
    ? Math.round(
        ((review.precoOriginal - review.preco) / review.precoOriginal) * 100,
      )
    : 0;

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary no-underline">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/reviews" className="hover:text-primary no-underline">
          Reviews
        </Link>{" "}
        /{" "}
        {categoria && (
          <>
            <Link
              href={`/categorias/${categoria.slug}`}
              className="hover:text-primary no-underline"
            >
              {categoria.nome}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-text">{review.titulo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Cabeçalho da review */}
          <header className="mb-8">
            {categoria && (
              <Link
                href={`/categorias/${categoria.slug}`}
                className="text-xs uppercase tracking-[0.2em] text-primary font-bold no-underline hover:underline"
              >
                {categoria.nome}
              </Link>
            )}
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              {review.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <RatingBadge nota={review.nota} />
              {review.emDestaque && (
                <span className="bg-accent-soft text-accent text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                  Destaque
                </span>
              )}
              <span className="text-sm text-text-muted">
                {review.marketplace}
              </span>
            </div>
            <p className="text-lg text-text-soft leading-relaxed">
              {review.resumo}
            </p>
          </header>

          {/* Imagem principal */}
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-bg-gray mb-8 border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={review.imagem}
              alt={review.produto}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Caixa de compra (sempre visível) */}
          <div className="bg-gradient-to-br from-primary-light to-bg border border-primary/20 rounded-xl p-6 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">
                  {review.marketplace}
                </p>
                <p className="text-2xl font-extrabold text-text">
                  {review.produto}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-primary">
                    R$ {review.preco.toLocaleString("pt-BR")}
                  </span>
                  {review.precoOriginal && (
                    <span className="text-sm text-text-muted line-through">
                      R$ {review.precoOriginal.toLocaleString("pt-BR")}
                    </span>
                  )}
                  {desconto > 0 && (
                    <span className="bg-danger text-white text-xs font-extrabold px-2 py-0.5 rounded">
                      -{desconto}%
                    </span>
                  )}
                </div>
              </div>
              <a
                href={review.linkAfiliado}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3.5 rounded-lg no-underline transition text-base whitespace-nowrap"
              >
                Ver oferta no {review.marketplace} →
              </a>
            </div>
          </div>

          {/* Prós e Contras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-success-soft border border-success/30 rounded-xl p-5">
              <h3 className="text-sm font-extrabold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                <span aria-hidden>✓</span> Pontos positivos
              </h3>
              <ul className="space-y-2">
                {review.pros.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-soft flex gap-2 leading-snug"
                  >
                    <span className="text-success shrink-0">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-danger-soft border border-danger/30 rounded-xl p-5">
              <h3 className="text-sm font-extrabold text-danger uppercase tracking-wider mb-3 flex items-center gap-2">
                <span aria-hidden>✗</span> Pontos negativos
              </h3>
              <ul className="space-y-2">
                {review.contras.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-soft flex gap-2 leading-snug"
                  >
                    <span className="text-danger shrink-0">–</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conteúdo MDX */}
          <article className="prose-article mb-12">{compiled.content}</article>

          {/* CTA final */}
          <div className="bg-bg-alt border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-text-muted mb-3">
              Achou esta review útil? Aproveite a oferta:
            </p>
            <a
              href={review.linkAfiliado}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg no-underline transition"
            >
              Ver {review.produto} no {review.marketplace} →
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6">
            Outras reviews de {categoria?.nome ?? "produtos"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relacionados.map((r) => (
              <ReviewCard key={r.slug} review={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
