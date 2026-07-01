import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";

/** Hero da home — sóbrio, com chamadas para as principais categorias. */
export function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary-light/50 to-bg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
          Reviews e comparativos independentes
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-5">
          Compre certo, sem perder tempo
        </h1>
        <p className="text-base md:text-lg text-text-soft max-w-2xl mx-auto mb-8">
          Análises honestas de produtos com link direto para a melhor oferta no
          marketplace. Sem enrolação, sem publieditorial disfarçado.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {CATEGORIAS.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="bg-bg border border-border text-text-soft hover:border-primary hover:text-primary text-sm font-semibold px-4 py-2 rounded-full no-underline transition"
            >
              {c.nome}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
