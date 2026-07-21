import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import Image from "next/image";
import { OfertaHeroCard, OfertaVariante } from "@/components/OfertaDetalheCard";
import { OfertaSidebar } from "@/components/OfertaSidebar";
import { ProductCallout } from "@/components/ProductCallout";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductList } from "@/components/ProductList";
import { ProTip, Warning, Cite } from "@/components/ProTip";
import { obterTodasOfertas, obterOfertaPorSlug } from "@/lib/ofertas-content";
import { obterCategoria } from "@/lib/categorias";
import { SITE_NAME } from "@/lib/constants";

// =====================================================================
// STATIC PARAMS + METADATA
// =====================================================================

export function generateStaticParams() {
  return obterTodasOfertas().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const oferta = obterOfertaPorSlug(slug);
  if (!oferta)
    return { title: "Oferta não encontrada", robots: { index: false } };

  const titulo = `${oferta.titulo} | ${SITE_NAME}`;
  const descricao = oferta.resumo
    ? `${oferta.resumo} — R$ ${oferta.preco.toLocaleString("pt-BR")} no ${oferta.marketplace}.`
    : `Confira a oferta de ${oferta.produto} por R$ ${oferta.preco.toLocaleString("pt-BR")} no ${oferta.marketplace}.`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/ofertas/${oferta.slug}` },
    openGraph: {
      title: titulo,
      description: descricao,
      type: "article",
      images: oferta.imagem ? [{ url: oferta.imagem }] : [],
    },
  };
}

// =====================================================================
// PAGE
// =====================================================================

export default async function OfertaDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const oferta = obterOfertaPorSlug(slug);
  if (!oferta) return notFound();

  const todas = obterTodasOfertas();
  const relacionadas = todas
    .filter((o) => o.slug !== oferta.slug)
    .slice(0, 4);

  const categoria = oferta.categoria
    ? obterCategoria(oferta.categoria as never)
    : undefined;

  // Compila o MDX do conteúdo da oferta
  const compiled = oferta.conteudo
    ? await compileMDX({
        source: oferta.conteudo,
        components: {
          OfertaVariante,
          ProductCallout,
          ProductGrid,
          ProductList,
          ProTip,
          Warning,
          Cite,
        },
      })
    : null;

  const desconto =
    oferta.precoOriginal && oferta.precoOriginal > oferta.preco
      ? Math.round(
          ((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100,
        )
      : 0;

  return (
    <article className="bg-bg">
      {/* =================================================================
          BREADCRUMB
         ================================================================= */}
      <div className="border-b border-border bg-bg-alt">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-[0.65rem] sm:text-xs uppercase tracking-widest font-bold text-text-soft overflow-x-auto no-scrollbar min-w-0">
          <Link href="/" className="hover:text-primary no-underline shrink-0">
            {SITE_NAME}
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          <Link
            href="/ofertas"
            className="hover:text-primary no-underline shrink-0"
          >
            Ofertas
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          <span className="text-text truncate min-w-0 max-w-[60vw] sm:max-w-none">
            {oferta.titulo}
          </span>
        </nav>
      </div>

      {/* =================================================================
          HEADER — Título + Subtítulo
         ================================================================= */}
      <header className="max-w-6xl mx-auto px-4 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] font-extrabold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full border bg-primary-light text-primary border-primary/30">
            {oferta.marketplace}
          </span>
          {categoria && (
            <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] font-extrabold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full border bg-bg-alt text-text-soft border-border">
              {categoria.nome}
            </span>
          )}
          {oferta.emDestaque && (
            <span className="inline-flex items-center gap-1 bg-accent text-bg-dark text-[0.65rem] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
              ★ Destaque
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] sm:leading-[1.05] tracking-tight text-text mb-4 sm:mb-5 text-balance break-words-anywhere">
          {oferta.titulo}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-text-soft leading-relaxed max-w-3xl text-pretty">
          {oferta.resumo}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-xs sm:text-sm text-text-soft">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-primary to-primary-light text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0">
              U
            </div>
            <div>
              <p className="font-semibold text-text leading-tight text-xs sm:text-sm">
                Equipe {SITE_NAME}
              </p>
              <p className="text-[0.6rem] sm:text-[0.65rem] text-text-muted">
                Oferta verificada
              </p>
            </div>
          </div>
          {oferta.verificadoEm && (
            <>
              <span className="hidden sm:inline text-border">•</span>
              <span className="uppercase tracking-wider text-[0.65rem] sm:text-xs font-semibold text-text-muted flex items-center gap-1">
                <span className="text-green-500" aria-hidden>●</span>
                Verificado em{" "}
                {new Date(oferta.verificadoEm + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </span>
            </>
          )}
          {desconto > 0 && (
            <>
              <span className="hidden sm:inline text-border">•</span>
              <span className="bg-danger text-white text-[0.6rem] sm:text-xs font-extrabold px-2 py-0.5 rounded">
                -{desconto}% OFF
              </span>
            </>
          )}
        </div>
      </header>

      {/* =================================================================
          HERO IMAGE
         ================================================================= */}
      {oferta.imagem && (
        <figure className="max-w-6xl mx-auto px-4 mb-8">
          <div className="relative aspect-video sm:aspect-21/9 rounded-xl sm:rounded-2xl overflow-hidden bg-bg-gray shadow-floating">
            <Image
              src={oferta.imagem}
              alt={oferta.titulo}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain p-4 sm:p-6"
              priority
            />
          </div>
          {oferta.produto && (
            <figcaption className="text-[0.65rem] text-text-muted text-center mt-2 italic">
              {oferta.produto} — Divulgação
            </figcaption>
          )}
        </figure>
      )}

      {/* =================================================================
          CONTEÚDO PRINCIPAL + SIDEBAR (2 colunas estilo JC)
         ================================================================= */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-8 min-w-0">
            {/* Hero Card com preço e CTA */}
            <OfertaHeroCard oferta={oferta} />

            {/* Conteúdo MDX */}
            {compiled && (
              <div className="prose-article mb-10">
                {compiled.content}
              </div>
            )}

            {/* Disclaimer de afiliado (estilo JC) */}
            <div className="bg-bg-alt border border-border rounded-xl px-5 py-4 mb-8">
              <p className="text-xs text-text-muted italic leading-relaxed">
                <strong className="not-italic text-text-soft">
                  Nota de transparência:
                </strong>{" "}
                Selecionamos cuidadosamente os produtos apresentados neste artigo
                de maneira independente, e todos os preços, descontos e cupons
                foram verificados na data de publicação. Quando você realiza uma
                compra através dos links que fornecemos, podemos receber uma
                comissão, mas fique tranquilo, isso não implica em custos
                adicionais para você.
              </p>
            </div>

            {/* Tags (estilo JC) */}
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted mr-1">
                Tags:
              </span>
              {[
                oferta.marketplace,
                oferta.categoria,
                oferta.produto?.split(" ").slice(0, 2).join(" "),
                ...(oferta.tags ?? []),
              ]
                .filter(Boolean)
                .slice(0, 8)
                .map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.6rem] sm:text-xs font-semibold bg-bg-alt border border-border text-text-soft px-2.5 py-1 rounded-full hover:bg-primary-light hover:border-primary/30 hover:text-primary transition cursor-default"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Leia também — ofertas relacionadas */}
            {relacionadas.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mb-5 flex items-center gap-2 text-balance">
                  <span className="w-1 h-5 bg-primary rounded-full shrink-0" />
                  Leia também
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relacionadas.map((rel) => {
                    const descRel =
                      rel.precoOriginal && rel.precoOriginal > rel.preco
                        ? Math.round(
                            ((rel.precoOriginal - rel.preco) /
                              rel.precoOriginal) *
                              100,
                          )
                        : 0;
                    return (
                      <Link
                        key={rel.slug}
                        href={`/ofertas/${rel.slug}`}
                        className="group flex gap-3 bg-bg border border-border rounded-xl p-3 no-underline hover:border-primary/40 hover:shadow-elevated transition"
                      >
                        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-bg-gray flex items-center justify-center relative">
                          {rel.imagem ? (
                            <Image
                              src={rel.imagem}
                              alt={rel.titulo}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-[0.5rem] text-text-muted font-bold uppercase">
                              {rel.produto}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition text-text">
                            {rel.titulo}
                          </h3>
                          <p className="text-[0.65rem] text-text-muted mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-primary">
                              R$ {rel.preco.toLocaleString("pt-BR")}
                            </span>
                            {rel.precoOriginal && (
                              <span className="line-through">
                                R$ {rel.precoOriginal.toLocaleString("pt-BR")}
                              </span>
                            )}
                            {descRel > 0 && (
                              <span className="bg-danger text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded">
                                -{descRel}%
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24">
              <OfertaSidebar />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
