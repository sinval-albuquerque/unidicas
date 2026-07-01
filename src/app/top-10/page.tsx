import Link from "next/link";
import type { Metadata } from "next";
import { RatingBadge } from "@/components/RatingBadge";
import { obterTodasReviews } from "@/lib/reviews";
import { EXTERNAL_LINK_REL } from "@/lib/constants";
import { obterCategoria } from "@/lib/categorias";

export const metadata: Metadata = {
  title: "Top 10 — Os melhores produtos analisados",
  description:
    "Ranking dos 10 produtos com maior nota na nossa análise independente.",
};

export default function Top10Page() {
  const top = obterTodasReviews()
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Ranking
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Top 10 — Melhores Produtos
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          Os 10 produtos com maior nota entre todas as nossas reviews
          independentes.
        </p>
      </header>

      <ol className="space-y-3">
        {top.map((r, i) => {
          const categoria = obterCategoria(r.categoria);
          const desconto = r.precoOriginal
            ? Math.round(((r.precoOriginal - r.preco) / r.precoOriginal) * 100)
            : 0;
          return (
            <li
              key={r.slug}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-bg border border-border rounded-xl p-5 hover:border-primary transition"
            >
              <span
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${
                  i === 0
                    ? "bg-accent text-black"
                    : i < 3
                      ? "bg-primary text-white"
                      : "bg-bg-gray text-text"
                }`}
              >
                {i + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.imagem}
                alt={r.produto}
                className="shrink-0 w-24 h-24 rounded-lg object-cover bg-bg-gray"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary font-bold">
                  {categoria?.nome ?? r.categoria}
                </p>
                <h2 className="text-base font-extrabold text-text leading-snug mt-0.5">
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="text-text hover:text-primary no-underline"
                  >
                    {r.titulo}
                  </Link>
                </h2>
                <p className="text-xs text-text-soft mt-1 line-clamp-2">
                  {r.resumo}
                </p>
                <div className="mt-1.5">
                  <RatingBadge nota={r.nota} />
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
                <p className="text-xl font-extrabold text-text">
                  R$ {r.preco.toLocaleString("pt-BR")}
                </p>
                {desconto > 0 && (
                  <span className="bg-danger text-white text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded">
                    -{desconto}%
                  </span>
                )}
                <a
                  href={r.linkAfiliado}
                  target="_blank"
                  rel={EXTERNAL_LINK_REL}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg no-underline transition whitespace-nowrap"
                >
                  Ver oferta →
                </a>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 text-center">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-2 text-primary font-semibold no-underline hover:underline"
        >
          Ver todos os {obterTodasReviews().length} produtos →
        </Link>
      </div>
    </div>
  );
}
