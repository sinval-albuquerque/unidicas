import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matéria não encontrada",
  description: "A matéria que você procura não existe mais ou foi removida.",
  robots: { index: false, follow: true },
};

/**
 * 404 específico de /materias/[slug].
 *
 * - Mensagem clara
 * - CTA para /materias (lista completa) e / (home)
 * - `robots: noindex, follow` para não indexar 404s e seguir links úteis
 */
export default function MateriaNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent font-extrabold mb-3">
        404
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
        Matéria não encontrada
      </h1>
      <p className="text-base text-text-soft leading-relaxed mb-8 max-w-md mx-auto">
        A matéria que você procura não existe mais ou foi removida por estar
        desatualizada. Veja as matérias mais recentes do Unidicas.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/materias"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-xl no-underline transition shadow-glow-primary"
        >
          Ver todas as matérias
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-bg hover:bg-bg-alt border border-border text-text font-semibold px-5 py-3 rounded-xl no-underline transition hover:border-accent"
        >
          Ir para a home
        </Link>
      </div>
    </div>
  );
}
