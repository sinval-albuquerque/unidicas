import Link from "next/link";
import type { AtributoComparacao, Review } from "@/types/review";
import { ordenarPorAtributo } from "@/lib/comparacoes";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/** Ranking ordenado dos produtos por um atributo específico. */
export function AttributeRanking({
  atributo,
  reviews,
}: {
  atributo: AtributoComparacao;
  reviews: Review[];
}) {
  const ordenadas = ordenarPorAtributo(reviews, atributo);
  if (ordenadas.length === 0) return null;

  return (
    <div className="bg-bg border border-border rounded-xl p-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span aria-hidden>{atributo.icone}</span>
        Ranking — {atributo.label}
      </h3>
      <ol className="space-y-2">
        {ordenadas.map((r, i) => (
          <li key={r.slug} className="flex items-center gap-3 text-sm">
            <span className={`font-extrabold w-6 text-center ${i === 0 ? "text-accent" : "text-text-muted"}`}>
              {i + 1}
            </span>
            <Link href={`/reviews/${r.slug}`} className="flex-1 hover:text-primary font-medium truncate">
              {r.produto}
            </Link>
            <span className="font-bold text-text-muted">
              {r.atributos[atributo.id]?.toLocaleString("pt-BR")} {atributo.unidade}
            </span>
            <a
              href={r.linkAfiliado}
              rel={EXTERNAL_LINK_REL}
              target="_blank"
              className="text-success hover:underline text-xs font-semibold"
            >
              Oferta
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}