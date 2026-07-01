import Link from "next/link";
import Image from "next/image";
import type { Materia } from "@/types/materia";

interface Props {
  materia: Materia;
  /** "default" = card com imagem; "compact" = card sem imagem (listas densas); "featured" = hero. */
  variant?: "default" | "compact" | "featured";
}

/**
 * Card de matéria (artigo) em 3 variantes.
 * - default: grid de arquivos
 * - compact: lista lateral
 * - featured: destaque grande
 */
export function MateriaCard({ materia, variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <article className="flex gap-4 group">
        {materia.imagem && (
          <Link
            href={`/materias/${materia.slug}`}
            className="shrink-0 relative w-24 h-24 rounded-lg overflow-hidden bg-bg-gray"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={materia.imagem}
              alt=""
              className="w-full h-full object-cover transition group-hover:scale-105"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[0.7rem] uppercase tracking-wider text-primary font-bold mb-1">
            Matéria
          </p>
          <h3 className="text-sm font-bold leading-snug mb-1 line-clamp-2">
            <Link
              href={`/materias/${materia.slug}`}
              className="text-text hover:text-primary no-underline"
            >
              {materia.titulo}
            </Link>
          </h3>
          <time className="text-xs text-text-muted">{materia.data}</time>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group">
        <Link
          href={`/materias/${materia.slug}`}
          className="block relative aspect-[16/9] rounded-xl overflow-hidden bg-bg-gray mb-5 no-underline"
        >
          {materia.imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={materia.imagem}
              alt={materia.titulo}
              className="w-full h-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark" />
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Destaque
            </span>
          </div>
        </Link>
        <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">
          Matéria
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
          <Link
            href={`/materias/${materia.slug}`}
            className="text-text hover:text-primary no-underline"
          >
            {materia.titulo}
          </Link>
        </h2>
        <p className="text-text-soft leading-relaxed mb-3 line-clamp-2">
          {materia.resumo}
        </p>
        <time className="text-xs text-text-muted">{materia.data}</time>
      </article>
    );
  }

  // default
  return (
    <article className="group bg-bg border border-border rounded-xl overflow-hidden hover:shadow-md transition">
      <Link
        href={`/materias/${materia.slug}`}
        className="block relative aspect-[16/10] overflow-hidden bg-bg-gray no-underline"
      >
        {materia.imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={materia.imagem}
            alt={materia.titulo}
            className="w-full h-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
      </Link>
      <div className="p-5">
        <p className="text-[0.7rem] uppercase tracking-wider text-primary font-bold mb-2">
          Matéria
        </p>
        <h3 className="text-lg font-bold leading-snug mb-2 line-clamp-2">
          <Link
            href={`/materias/${materia.slug}`}
            className="text-text hover:text-primary no-underline"
          >
            {materia.titulo}
          </Link>
        </h3>
        <p className="text-sm text-text-soft leading-relaxed mb-3 line-clamp-2">
          {materia.resumo}
        </p>
        <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
          <time>{materia.data}</time>
          <span className="text-primary font-semibold group-hover:underline">
            Ler →
          </span>
        </div>
      </div>
    </article>
  );
}
