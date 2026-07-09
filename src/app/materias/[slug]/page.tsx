import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { MateriaCard } from "@/components/MateriaCard";
import { AffiliateCta } from "@/components/AffiliateCta";
import { ProductCallout } from "@/components/ProductCallout";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductList } from "@/components/ProductList";
import { ProTip, Warning, Cite } from "@/components/ProTip";
import { SecaoBadge } from "@/components/SecaoBadge";
import { obterMateriaPorSlug, obterTodasMaterias } from "@/lib/materias";
import { obterCategoria } from "@/lib/categorias";
import { obterSecao } from "@/lib/secoes";
import { obterTodasReviews } from "@/lib/reviews";
import { obterTodasOfertas } from "@/lib/ofertas-content";
import { SITE_NAME } from "@/lib/constants";

export function generateStaticParams() {
  return obterTodasMaterias().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const materia = obterMateriaPorSlug(slug);
  if (!materia) return { title: "Matéria não encontrada" };
  return {
    title: materia.metaTitle ?? materia.titulo,
    description: materia.metaDescription ?? materia.resumo,
    keywords: materia.metaKeywords,
    openGraph: {
      title: materia.metaTitle ?? materia.titulo,
      description: materia.metaDescription ?? materia.resumo,
      type: "article",
    },
  };
}

function tempoLeitura(texto: string): number {
  const palavras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palavras / 200));
}

function pickOfertaPrincipal(materia: { categoria?: string }) {
  const ofertas = obterTodasOfertas();
  if (ofertas.length > 0) {
    if (materia.categoria) {
      const match = ofertas.find((o) => o.categoria === materia.categoria);
      if (match) return match;
    }
    return ofertas[0];
  }
  const reviews = obterTodasReviews();
  if (materia.categoria) {
    const match = reviews.find((r) => r.categoria === materia.categoria);
    if (match) return match;
  }
  return reviews[0];
}

export default async function MateriaSinglePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const materia = obterMateriaPorSlug(slug);
  if (!materia) return notFound();

  const todas = obterTodasMaterias();
  const relacionadas = todas
    .filter((m) => m.slug !== materia.slug)
    .slice(0, 3);

  const categoria = materia.categoria ? obterCategoria(materia.categoria as never) : undefined;
  const secao = categoria ? obterSecao(categoria.secao) : undefined;
  const oferta = pickOfertaPrincipal(materia);
  const tempo = tempoLeitura(materia.conteudo);

  const compiled = await compileMDX({
    source: materia.conteudo,
    components: {
      ProductCallout,
      ProductGrid,
      ProductList,
      AffiliateCta,
      ProTip,
      Warning,
      Cite,
    },
  });

  return (
    <article className="bg-bg">
      <div className="border-b border-border bg-bg-alt">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-text-soft overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary no-underline shrink-0">
            {SITE_NAME}
          </Link>
          <span className="text-text-muted shrink-0">/</span>
          {categoria && secao ? (
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
          ) : (
            <>
              <Link href="/materias" className="hover:text-primary no-underline shrink-0">
                Matérias
              </Link>
              <span className="text-text-muted shrink-0">/</span>
            </>
          )}
          <span className="text-text truncate">{materia.titulo}</span>
        </div>
      </div>

      <header className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {categoria && secao && (
            <SecaoBadge secao={secao} link size="md" />
          )}
          {materia.destaque && (
            <span className="inline-flex items-center gap-1 bg-accent text-bg-dark text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ★ Destaque
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-text mb-6">
          {materia.titulo}
        </h1>

        <p className="text-lg md:text-xl text-text-soft leading-relaxed max-w-3xl mb-8">
          {materia.resumo}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-soft">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-extrabold text-sm">
              U
            </div>
            <div>
              <p className="font-semibold text-text leading-tight">Equipe {SITE_NAME}</p>
              <p className="text-xs text-text-muted">Editorial</p>
            </div>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <time
            dateTime={materia.data}
            className="uppercase tracking-wider text-xs font-semibold"
          >
            {new Date(materia.data).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span className="hidden sm:inline text-border">•</span>
          <span className="uppercase tracking-wider text-xs font-semibold text-text-muted">
            {tempo} min de leitura
          </span>
        </div>
      </header>

      {materia.imagem && (
        <figure className="max-w-6xl mx-auto px-4 mb-12">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-bg-gray shadow-floating">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={materia.imagem}
              alt={materia.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        </figure>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 min-w-0">
            <div className="prose-article">{compiled.content}</div>

            {oferta && (
              <div className="mt-12 not-prose">
                <AffiliateCta
                  variant="primary"
                  titulo="Oferta selecionada para você"
                  subtitulo="Aproveite o preço promocional enquanto está disponível."
                  href={oferta.linkAfiliado}
                  ctaLabel="Ver oferta agora"
                  produto={oferta.titulo}
                  preco={oferta.preco}
                  precoOriginal={oferta.precoOriginal}
                  marketplace={oferta.marketplace}
                  imagem={oferta.imagem}
                />
              </div>
            )}

            <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Tags:
              </span>
              {(materia.metaKeywords ?? []).slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold bg-bg-alt border border-border text-text-soft px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            {oferta && (
              <div className="sticky top-24">
                <AffiliateCta
                  variant="sidebar"
                  titulo="Oferta em destaque"
                  href={oferta.linkAfiliado}
                  ctaLabel="Ver oferta"
                  produto={oferta.titulo}
                  preco={oferta.preco}
                  precoOriginal={oferta.precoOriginal}
                  marketplace={oferta.marketplace}
                  imagem={oferta.imagem}
                />

                {todas.length > 1 && (
                  <div className="mt-8 bg-bg-alt border border-border rounded-2xl p-5">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-soft mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent rounded-full" />
                      Últimas matérias
                    </h3>
                    <ul className="space-y-4">
                      {todas
                        .filter((m) => m.slug !== materia.slug)
                        .slice(0, 4)
                        .map((m) => (
                          <li key={m.slug} className="flex gap-3 group">
                            {m.imagem && (
                              <Link
                                href={`/materias/${m.slug}`}
                                className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-bg-gray"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={m.imagem}
                                  alt=""
                                  className="w-full h-full object-cover transition group-hover:scale-110"
                                />
                              </Link>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:text-primary transition">
                                <Link
                                  href={`/materias/${m.slug}`}
                                  className="text-text no-underline"
                                >
                                  {m.titulo}
                                </Link>
                              </h4>
                              <p className="text-xs text-text-muted mt-1">
                                {new Date(m.data).toLocaleDateString("pt-BR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {relacionadas.length > 0 && (
        <section className="border-t border-border bg-bg-alt py-14">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-primary rounded-full" />
              Leia também
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relacionadas.map((m) => (
                <MateriaCard key={m.slug} materia={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
