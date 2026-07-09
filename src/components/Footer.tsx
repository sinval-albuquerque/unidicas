import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { EXTERNAL_LINK_REL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { Logo } from "./Logo";

/** Links dos canais oficiais do Unidicas. */
const CANAL_TELEGRAM_URL = "https://t.me/unidicasofertas";
const CANAL_WHATSAPP_URL =
  "https://chat.whatsapp.com/Ga0FSuBeFEdAQU0tzrdEOA?s=cl&p=a&ilr=4&amv=0";

/** Rodapé com 4 colunas, descrição, links institucionais e disclaimer de afiliação. */
export function Footer() {
  return (
    <footer className="bg-bg-alt border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size={44} />
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

        {/* Redes sociais + canais */}
        <div className="mb-8">
          <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3 text-text">
            Siga o {SITE_NAME}
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://instagram.com/unidicas1"
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="Instagram do Unidicas (@unidicas1)"
              className="inline-flex items-center gap-2 text-sm text-text-soft hover:text-primary no-underline transition"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </span>
              <span>@unidicas1</span>
            </a>
            <a
              href={CANAL_TELEGRAM_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="Telegram do Unidicas (abre em nova aba)"
              className="inline-flex items-center gap-2 text-sm text-text-soft hover:text-primary no-underline transition"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#229ED9] text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9.999 14.999l-.4 3.6c.572 0 .82-.246 1.118-.541l2.682-2.557 5.555 4.054c1.018.561 1.741.266 2.018-.943L22.999 3.077l-.001-.001c.323-1.603-1.04-2.228-2.026-1.851L1.241 9.314c-1.564.611-1.54 1.487-.265 1.881l5.443 1.693 12.643-7.964c.594-.394 1.134-.176.69.218L9.999 14.999z" />
                </svg>
              </span>
              <span>Telegram</span>
            </a>
            <a
              href={CANAL_WHATSAPP_URL}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              aria-label="WhatsApp do Unidicas (abre em nova aba)"
              className="inline-flex items-center gap-2 text-sm text-text-soft hover:text-primary no-underline transition"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
              </span>
              <span>WhatsApp</span>
            </a>
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
