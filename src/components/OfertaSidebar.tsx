import Link from "next/link";
import Image from "next/image";
import { obterOfertasEmDestaque, obterTodasOfertas } from "@/lib/ofertas-content";

/**
 * Sidebar para páginas de ofertas — inspirada no JC Concursos.
 *
 * Widgets:
 *  - Busca
 *  - Ofertas em destaque (analogia a "+ Mais Lidas")
 *  - Últimas ofertas (analogia a "+ Últimas")
 */
export function OfertaSidebar() {
  const ofertas = obterTodasOfertas();
  const destaques = obterOfertasEmDestaque().slice(0, 5);
  const ultimas = [...ofertas].reverse().slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* Busca */}
      <div className="bg-bg border border-border rounded-xl p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border">
          Buscar ofertas
        </h3>
        <form
          action="/ofertas"
          method="GET"
          className="relative"
        >
          <input
            type="text"
            name="q"
            placeholder="Ex: notebook, fone, celular..."
            className="w-full text-sm bg-bg-alt border border-border rounded-lg px-3.5 py-2.5 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-md transition"
          >
            OK
          </button>
        </form>
      </div>

      {/* + Lidas / Destaques */}
      {destaques.length > 0 && (
        <div className="bg-bg border border-border rounded-xl p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border flex items-center gap-2">
            <span className="text-accent" aria-hidden>★</span>
            Ofertas em destaque
          </h3>
          <div className="space-y-4">
            {destaques.map((oferta) => {
              const desconto =
                oferta.precoOriginal && oferta.precoOriginal > oferta.preco
                  ? Math.round(
                      ((oferta.precoOriginal - oferta.preco) /
                        oferta.precoOriginal) *
                        100,
                    )
                  : 0;

              return (
                <div key={oferta.slug} className="flex gap-3 group min-w-0">
                  <Link
                    href={`/ofertas/${oferta.slug}`}
                    className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-bg-gray flex items-center justify-center relative"
                  >
                    {oferta.imagem ? (
                      <Image
                        src={oferta.imagem}
                        alt={oferta.titulo}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-[0.5rem] text-text-muted font-bold uppercase">
                        {oferta.produto}
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-primary transition">
                      <Link
                        href={`/ofertas/${oferta.slug}`}
                        className="text-text no-underline"
                      >
                        {oferta.titulo}
                      </Link>
                    </h4>
                    <p className="text-[0.65rem] text-text-muted mt-1 flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-primary">
                        R$ {oferta.preco.toLocaleString("pt-BR")}
                      </span>
                      {desconto > 0 && (
                        <span className="bg-danger text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded">
                          -{desconto}%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* + Últimas */}
      {ultimas.length > 0 && (
        <div className="bg-bg border border-border rounded-xl p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 pb-2 border-b border-border">
            + Últimas
          </h3>
          <div className="space-y-3">
            {ultimas.map((oferta, idx) => (
              <div key={oferta.slug}>
                <Link
                  href={`/ofertas/${oferta.slug}`}
                  className="text-xs text-text-soft hover:text-primary no-underline leading-snug block"
                >
                  <span className="font-semibold text-text">
                    {oferta.titulo}
                  </span>
                  <span className="block text-[0.6rem] text-text-muted mt-0.5">
                    R$ {oferta.preco.toLocaleString("pt-BR")}
                    {oferta.precoOriginal &&
                      ` • de R$ ${oferta.precoOriginal.toLocaleString("pt-BR")}`}
                  </span>
                </Link>
                {idx < ultimas.length - 1 && (
                  <hr className="border-border my-2" />
                )}
              </div>
            ))}
          </div>
          <Link
            href="/ofertas"
            className="block text-center text-xs font-bold text-primary hover:underline mt-3 pt-2 border-t border-border"
          >
            » Ver todas as ofertas
          </Link>
        </div>
      )}
    </aside>
  );
}
