import Link from "next/link";
import { Logo } from "./Logo";
import { NavBar } from "./NavBar";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/** Links dos canais oficiais do Unidicas (ícones no header + footer). */
const CANAL_TELEGRAM_URL = "https://t.me/unidicasofertas";
const CANAL_WHATSAPP_URL =
  "https://chat.whatsapp.com/Ga0FSuBeFEdAQU0tzrdEOA?s=cl&p=a&ilr=4&amv=0";

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
          <div className="hidden sm:flex items-center gap-4">
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
            {/* Ícones dos canais — Telegram + WhatsApp */}
            <div className="flex items-center gap-1.5 pl-3 ml-1 border-l border-border/60">
              <a
                href={CANAL_TELEGRAM_URL}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                aria-label="Telegram do Unidicas (abre em nova aba)"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#229ED9] text-white hover:opacity-90 hover:scale-105 transition no-underline"
              >
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.999 14.999l-.4 3.6c.572 0 .82-.246 1.118-.541l2.682-2.557 5.555 4.054c1.018.561 1.741.266 2.018-.943L22.999 3.077l-.001-.001c.323-1.603-1.04-2.228-2.026-1.851L1.241 9.314c-1.564.611-1.54 1.487-.265 1.881l5.443 1.693 12.643-7.964c.594-.394 1.134-.176.69.218L9.999 14.999z" />
                </svg>
              </a>
              <a
                href={CANAL_WHATSAPP_URL}
                target="_blank"
                rel={EXTERNAL_LINK_REL}
                aria-label="WhatsApp do Unidicas (abre em nova aba)"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-white hover:opacity-90 hover:scale-105 transition no-underline"
              >
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-6 py-3.5">
          <Logo size={40} priority />

          <NavBar />
        </div>
      </div>
    </header>
  );
}
