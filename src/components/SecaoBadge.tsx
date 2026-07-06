import Link from "next/link";
import type { Secao } from "@/types/review";

interface SecaoBadgeProps {
  secao: Secao;
  /** Quando true, vira um Link para /secoes/[slug]. */
  link?: boolean;
  /** Tamanho do badge. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Badge de seção — pílula colorida com o nome da seção.
 * Usa a cor da seção apenas em primeiro plano (texto + borda + fundo suave),
 * sem afetar o tema global da página.
 */
export function SecaoBadge({
  secao,
  link = false,
  size = "sm",
  className = "",
}: SecaoBadgeProps) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1 text-xs";
  const style = {
    color: secao.cor,
    backgroundColor: secao.corLight,
    borderColor: secao.cor,
  };

  const content = (
    <span
      style={style}
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wide border rounded-full no-underline ${padding} ${className}`}
    >
      {secao.icone && <span aria-hidden>{secao.icone}</span>}
      {secao.nome}
    </span>
  );

  if (!link) return content;

  return (
    <Link
      href={`/secoes/${secao.slug}`}
      className="no-underline hover:opacity-80 transition"
    >
      {content}
    </Link>
  );
}