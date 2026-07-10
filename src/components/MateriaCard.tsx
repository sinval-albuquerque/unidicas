import Link from "next/link";
import Image from "next/image";
import type { Materia } from "@/types/materia";
import { obterCategoria } from "@/lib/categorias";

interface Props {
  materia: Materia;
  /** "default" = card com imagem; "compact" = card sem imagem (listas densas); "featured" = hero. */
  variant?: "default" | "compact" | "featured";
}

/**
 * Card de materia (artigo) em 3 variantes.
 * - default: grid de arquivos
 * - compact: lista lateral
 * - featured: destaque grande
 */
export function MateriaCard({ materia, variant = "default" }: Props) {
  const categoria = materia.categoria ? obterCategoria(materia.categoria as never) : undefined;

  if (variant === "compact") {
    return (
      <article className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-bg-alt transition">
        {materia.imagem && (
          <Link
            href={`/materias/${materia.slug}`}
            className="shrink-0 relative w-20 h-20 rounded-lg overflow-hidden bg-bg-gray shadow-soft flex items-center justify-center"
          >
            <span className="text-[0.55rem] text-text-muted font-bold uppercase tracking-widest">
              {categoria?.nome ?? "materia"}
            </span>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[0.65rem] uppercase tracking-widest text-primary font-bold mb-1">
            Materia
          </p>
          <h3 className="text-sm font-bold leading-snug mb-1.5 line-clamp-2">
            <Link
              href={`/materias/${materia.slug}`}
              className="text-text hover:text-primary no-underline transition"
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
          className="block relative aspect-[16/9] rounded-2xl overflow-hidden bg-bg-gray mb-5 no-underline shadow-elevated"
        >
          {materia.imagem ? (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">
                {categoria?.nome ?? "materia"}
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark" />
          )}

          {/* Overlay gradient inferior para legibilidade */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-accent text-bg-dark text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-soft">
              ★ Destaque
            </span>
            {categoria && (
              <span className="bg-white/95 text-text text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-soft">
                {categoria.nome}
              </span>
            )}
          </div>

          {/* Titulo sobre imagem */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-[0.65rem] uppercase tracking-widest text-accent font-bold mb-2">
              Materia
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-lg">
              {materia.titulo}
            </h2>
          </div>
        </Link>
      </article>
    );
  }

  // default
  return (
    <article className="group bg-bg border border-border rounded-2xl overflow-hidden hover-lift shadow-soft hover:shadow-floating flex flex-col h-full">
      <Link
        href={`/materias/${materia.slug}`}
        className="block relative aspect-[16/10] overflow-hidden bg-bg-gray no-underline"
      >
        {materia.imagem ? (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">
              {categoria?.nome ?? "materia"}
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark" />
        )}

        {categoria && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-text text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-soft">
              {categoria.nome}
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[0.65rem] uppercase tracking-widest text-primary font-bold mb-2">
          Materia
        </p>
        <h3 className="text-base font-bold leading-snug mb-2 line-clamp-2">
          <Link
            href={`/materias/${materia.slug}`}
            className="text-text hover:text-primary no-underline transition"
          >
            {materia.titulo}
          </Link>
        </h3>
        <p className="text-xs text-text-soft leading-relaxed mb-4 line-clamp-2 flex-1">
          {materia.resumo}
        </p>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <time>{materia.data}</time>
          <span className="text-primary font-semibold group-hover:translate-x-1 transition">
            Ler mais →
          </span>
        </div>
      </div>
    </article>
  );
}
