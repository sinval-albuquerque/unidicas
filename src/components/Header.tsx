import Link from "next/link";
import { Logo } from "./Logo";
import { NavBar } from "./NavBar";

/** Cabecalho fixo no topo - glass effect, logo a esquerda, nav central, busca + CTA a direita. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      {/* Barra superior fina: tagline / contato */}
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-1.5 text-xs text-text-soft flex justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-accent" aria-hidden>★</span>
            <span>Reviews honestas, ofertas reais, sem enrolacao.</span>
          </span>
          <div className="hidden sm:flex gap-4">
            <Link
              href="/como-funciona"
              className="hover:text-primary no-underline transition"
            >
              Como funciona
            </Link>
            <Link href="/sobre" className="hover:text-primary no-underline transition">
              Sobre
            </Link>
            <Link href="/contato" className="hover:text-primary no-underline transition">
              Contato
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-6 py-3.5">
          <Logo size={40} priority />

          {/* Em mobile o CTA "Ver catalogo" + hamburguer moram dentro do NavBar. */}
          {/* Em desktop o NavBar mostra so a nav horizontal; o CTA vive aqui. */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/produtos"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline transition shadow-glow-primary"
            >
              Ver catalogo
            </Link>
          </div>

          <NavBar />
        </div>
      </div>
    </header>
  );
}
