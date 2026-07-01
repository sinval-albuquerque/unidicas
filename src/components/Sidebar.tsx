import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { obterTodasReviews, obterReviewsEmDestaque } from "@/lib/reviews";
import { obterTodasMaterias } from "@/lib/materias";
import { MateriaCard } from "./MateriaCard";

/** Sidebar reutilizável (widgets): busca, categorias, últimas matérias, top reviews. */
export function Sidebar() {
  const reviews = obterReviewsEmDestaque().slice(0, 4);
  const materias = obterTodasMaterias().slice(0, 3);
  const todasReviews = obterTodasReviews();

  return (
    <aside className="space-y-8">
      {/* Categorias */}
      <div className="bg-bg border border-border rounded-xl p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border">
          Categorias
        </h3>
        <ul className="space-y-2.5">
          {CATEGORIAS.map((c) => {
            const count = todasReviews.filter((r) => r.categoria === c.slug).length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/categorias/${c.slug}`}
                  className="flex items-center justify-between text-sm text-text-soft hover:text-primary no-underline"
                >
                  <span>{c.nome}</span>
                  <span className="text-xs text-text-muted bg-bg-gray rounded-full px-2 py-0.5">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Top reviews */}
      <div className="bg-bg border border-border rounded-xl p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border">
          Top Reviews
        </h3>
        <ol className="space-y-3">
          {reviews.map((r, i) => (
            <li key={r.slug} className="flex items-center gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-extrabold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/reviews/${r.slug}`}
                  className="text-sm font-semibold text-text hover:text-primary no-underline line-clamp-2 leading-snug"
                >
                  {r.titulo}
                </Link>
                <p className="text-xs text-text-muted mt-0.5">
                  ⭐ {r.nota.toFixed(1)} · {r.categoria}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Últimas matérias */}
      <div className="bg-bg border border-border rounded-xl p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border">
          Últimas Matérias
        </h3>
        <div className="space-y-5">
          {materias.map((m) => (
            <MateriaCard key={m.slug} materia={m} variant="compact" />
          ))}
        </div>
      </div>
    </aside>
  );
}
