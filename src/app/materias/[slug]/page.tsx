import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { Sidebar } from "@/components/Sidebar";
import { MateriaCard } from "@/components/MateriaCard";
import { ProductCallout } from "@/components/ProductCallout";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductList } from "@/components/ProductList";
import { ProTip, Warning, Cite } from "@/components/ProTip";
import { obterMateriaPorSlug, obterTodasMaterias } from "@/lib/materias";
import { CATEGORIAS } from "@/lib/categorias";

export function generateStaticParams() {
  return obterTodasMaterias().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const materia = obterMateriaPorSlug(params.slug);
  if (!materia) return { title: "Matéria não encontrada" };
  return {
    title: materia.titulo,
    description: materia.resumo,
  };
}

/** Página de matéria: header, imagem, MDX, sidebar, relacionadas, autor. */
export default async function MateriaSinglePage({
  params,
}: {
  params: { slug: string };
}) {
  const materia = obterMateriaPorSlug(params.slug);
  if (!materia) return notFound();

  const todas = obterTodasMaterias();
  const relacionadas = todas
    .filter((m) => m.slug !== materia.slug)
    .slice(0, 3);

  const compiled = await compileMDX({
    source: materia.conteudo,
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
        <Link href="/materias" className="hover:text-primary no-underline">
          Matérias
        </Link>{" "}
        / <span className="text-text">{materia.titulo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2">
          {/* Cabeçalho */}
          <header className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
              Matéria
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              {materia.titulo}
            </h1>
            <p className="text-lg text-text-soft leading-relaxed mb-5">
              {materia.resumo}
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  U
                </div>
                <div>
                  <p className="font-semibold text-text leading-tight">
                    Equipe Unidicas
                  </p>
                  <time className="text-xs">Publicado em {materia.data}</time>
                </div>
              </div>
            </div>
          </header>

          {/* Imagem destacada */}
          {materia.imagem && (
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-bg-gray mb-8 border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={materia.imagem}
                alt={materia.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Conteúdo MDX */}
          <div className="mb-10">{compiled.content}</div>

          {/* CTA final: explorar reviews */}
          <div className="bg-gradient-to-br from-primary-light to-bg border border-primary/20 rounded-xl p-6 mb-12">
            <h3 className="text-lg font-extrabold text-text mb-2">
              Quer ver reviews detalhadas?
            </h3>
            <p className="text-sm text-text-soft mb-4">
              Confira nossas análises completas com prós, contras, nota e link
              para a melhor oferta.
            </p>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg no-underline transition"
            >
              Ver todas as reviews →
            </Link>
          </div>

          {/* Compartilhar + tags */}
          <div className="flex flex-wrap items-center gap-3 py-6 border-t border-b border-border mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Categorias:
            </span>
            {CATEGORIAS.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className="text-xs font-semibold bg-bg-alt border border-border text-text-soft hover:border-primary hover:text-primary px-3 py-1 rounded-full no-underline transition"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </article>

        <Sidebar />
      </div>

      {/* Matérias relacionadas */}
      {relacionadas.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6">
            Leia também
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relacionadas.map((m) => (
              <MateriaCard key={m.slug} materia={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
