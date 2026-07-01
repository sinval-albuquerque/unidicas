import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Logo } from "./Logo";

/** Rodapé com 4 colunas, descrição, links institucionais e disclaimer de afiliação. */
export function Footer() {
  return (
    <footer className="bg-bg-alt border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size={36} />
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Reviews honestas e ofertas reais para você comprar certo.
              Independente, transparente, sem enrolação.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-text">
              Conteúdo
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/materias" className="text-sm text-text-soft hover:text-primary no-underline">
                  Matérias
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="text-sm text-text-soft hover:text-primary no-underline">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/top-10" className="text-sm text-text-soft hover:text-primary no-underline">
                  Top 10
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-sm text-text-soft hover:text-primary no-underline">
                  Categorias
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-text">
              Categorias
            </h4>
            <ul className="space-y-2">
              {CATEGORIAS.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="text-sm text-text-soft hover:text-primary no-underline"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-text">
              Institucional
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-sm text-text-soft hover:text-primary no-underline">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-sm text-text-soft hover:text-primary no-underline">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/adicionar-produto" className="text-sm text-text-soft hover:text-primary no-underline">
                  ✨ Adicionar produto
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-text-soft hover:text-primary no-underline">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-sm text-text-soft hover:text-primary no-underline">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-text-muted leading-relaxed max-w-3xl mb-3">
            <strong>Divulgação:</strong> alguns links deste site são de
            afiliados. Quando você compra por eles, podemos receber uma pequena
            comissão sem custo adicional para você. Isso nos ajuda a manter o
            site no ar e continuar produzindo conteúdo independente.
          </p>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {SITE_NAME} —{" "}
            {SITE_URL.replace(/^https?:\/\//, "")}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
