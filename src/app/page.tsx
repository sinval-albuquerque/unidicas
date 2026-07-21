import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { MateriaCard } from "@/components/MateriaCard";
import { ReviewCard } from "@/components/ReviewCard";
import { obterTodasMaterias } from "@/lib/materias";
import { obterTodasReviews, obterReviewsEmDestaque, obterReviewsPorCategoria } from "@/lib/reviews";
import { CATEGORIAS } from "@/lib/categorias";
import { obterMelhoresPorAtributo } from "@/lib/comparacoes";

export default function HomePage() {
  const materias = obterTodasMaterias();
  const todasReviews = obterTodasReviews();
  const destaques = obterReviewsEmDestaque();

  const materiaDestaque = materias[0];
  const outrasMaterias = materias.slice(1, 5);

  // eslint-disable-next-line react-hooks/purity
  const agora = Date.now();

  return (
    <>
      <Hero agora={agora} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* =================================================================
            BLOCO 1 — Matérias em destaque (hero matéria + lista lateral)
           ================================================================= */}
        {materiaDestaque && (
          <section className="mb-14">
            <SectionHeader
              titulo="Últimas Matérias"
              subtitulo="Comparativos e guias para você decidir melhor"
              linkVerTudo="/materias"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Matéria principal (2/3) */}
              <div className="lg:col-span-2">
                <MateriaCard materia={materiaDestaque} variant="featured" />
              </div>

              {/* Lista lateral (1/3) */}
              <div className="space-y-6">
                {outrasMaterias.map((m) => (
                  <MateriaCard key={m.slug} materia={m} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================
            BLOCO 2 — Reviews em destaque + sidebar
           ================================================================= */}
        <section className="mb-14">
          <SectionHeader
            titulo="Reviews em Destaque"
            subtitulo="Os produtos com melhor avaliação da semana"
            linkVerTudo="/reviews"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {destaques.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {destaques.slice(0, 4).map((r) => (
                    <ReviewCard key={r.slug} review={r} />
                  ))}
                </div>
              ) : (
                <p className="text-text-muted">Nenhuma review em destaque.</p>
              )}
            </div>
            <Sidebar />
          </div>
        </section>

        {/* =================================================================
            BLOCO 3 — Comparações por categoria (melhor por atributo)
           ================================================================= */}
        <section className="mb-14">
          <SectionHeader
            titulo="Melhores por Categoria"
            subtitulo="O vencedor de cada atributo em cada categoria"
            linkVerTudo="/categorias"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIAS.slice(0, 3).map((categoria) => {
              const reviews = obterReviewsPorCategoria(categoria.slug);
              if (reviews.length === 0) return null;
              const melhor = obterMelhoresPorAtributo(categoria, reviews)[0];
              if (!melhor) return null;
              return (
                <Link
                  key={categoria.slug}
                  href={`/categorias/${categoria.slug}/comparar`}
                  className="group block bg-bg border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition no-underline"
                >
                  <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">
                    {categoria.nome}
                  </p>
                  <p className="text-sm text-text-muted mb-4">
                    {categoria.descricao}
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-text-muted mb-1">
                      Melhor {melhor.atributo.label.toLowerCase()}
                    </p>
                    <p className="text-base font-extrabold text-text group-hover:text-primary">
                      {melhor.review.produto}
                    </p>
                    <p className="text-lg font-extrabold text-success mt-1">
                      {melhor.valor.toLocaleString("pt-BR")}{" "}
                      <span className="text-sm text-text-muted font-normal">
                        {melhor.atributo.unidade}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =================================================================
            BLOCO 4 — Todas as reviews
           ================================================================= */}
        <section className="mb-10">
          <SectionHeader
            titulo="Todas as Reviews"
            subtitulo="Catálogo completo de produtos analisados"
            linkVerTudo="/reviews"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {todasReviews.slice(0, 8).map((r) => (
              <ReviewCard key={r.slug} review={r} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/** Cabeçalho padronizado de seção: tag + título + subtítulo + "ver tudo". */
function SectionHeader({
  titulo,
  subtitulo,
  linkVerTudo,
}: {
  titulo: string;
  subtitulo?: string;
  linkVerTudo: string;
}) {
  return (
    <div className="flex items-end justify-between border-b-2 border-border pb-3 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{titulo}</h2>
        {subtitulo && (
          <p className="text-sm text-text-muted mt-1">{subtitulo}</p>
        )}
      </div>
      <Link
        href={linkVerTudo}
        className="text-sm text-primary font-semibold no-underline hover:underline whitespace-nowrap"
      >
        Ver todas →
      </Link>
    </div>
  );
}
