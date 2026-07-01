import Link from "next/link";
import type { MelhorPorAtributo } from "@/types/review";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/** Card destacando o vencedor de um atributo (ex: "Melhor bateria"). */
export function BestByAttributeCard({ melhor }: { melhor: MelhorPorAtributo }) {
  const { atributo, review, valor } = melhor;
  return (
    <div className="bg-bg border border-border rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl" aria-hidden>{atributo.icone ?? "🏆"}</span>
        <span className="text-xs font-bold text-primary uppercase tracking-wide">
          Melhor {atributo.label.toLowerCase()}
        </span>
      </div>
      <Link href={`/reviews/${review.slug}`} className="block">
        <h3 className="font-bold text-sm leading-snug mb-1.5 hover:text-primary">
          {review.produto}
        </h3>
      </Link>
      <div className="text-2xl font-extrabold text-success mb-2">
        {valor.toLocaleString("pt-BR")} <span className="text-sm font-normal text-text-muted">{atributo.unidade}</span>
      </div>
      <a
        href={review.linkAfiliado}
        rel={EXTERNAL_LINK_REL}
        target="_blank"
        className="block text-center bg-primary text-white py-1.5 rounded-lg font-semibold text-xs hover:bg-primary-dark transition"
      >
        Ver produto
      </a>
    </div>
  );
}