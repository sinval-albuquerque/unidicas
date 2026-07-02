import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { Logo } from "./Logo";

/** Cabeçalho fixo no topo — logo à esquerda, nav central, busca + CTA à direita. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border">
      {/* Barra superior fina: tagline / contato */}
      <div className="bg-bg-alt border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-1.5 text-xs text-text-soft flex justify-between">
          <span>
            <span aria-hidden>★</span> Reviews honestas, ofertas reais, sem
            enrolação.
          </span>
          <div className="hidden sm:flex gap-4">
            <Link
              href="/como-funciona"
              className="hover:text-primary no-underline"
            >
              Como funciona
            </Link>
            <Link href="/sobre" className="hover:text-primary no-underline">
              Sobre
            </Link>
            <Link href="/contato" className="hover:text-primary no-underline">
              Contato
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-6 py-3">
          <Logo size={32} priority />


          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-text-soft hover:text-primary no-underline"
            >
              Início
            </Link>
            <Link
              href="/materias"
              className="text-text-soft hover:text-primary no-underline"
            >
              Matérias
            </Link>
            <Link
              href="/produtos"
              className="text-text-soft hover:text-primary no-underline"
            >
              Produtos
            </Link>
            <Link
              href="/top-10"
              className="text-text-soft hover:text-primary no-underline"
            >
              Top 10
            </Link>
            {CATEGORIAS.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className="text-text-soft hover:text-primary no-underline"
              >
                {c.nome}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/produtos"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline transition"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
