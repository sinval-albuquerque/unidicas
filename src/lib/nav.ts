/**
 * Itens de navegação primários do Unidicas.
 * Compartilhados entre NavBar (desktop) e MobileNav (drawer).
 *
 * Manter uma única fonte de verdade evita divergência entre os
 * dois menus quando adicionamos/renomeamos páginas.
 *
 * `destaque: true` faz o item aparecer com cor de destaque
 * (acento âmbar) — usado para chamar atenção em CTAs como "Ofertas".
 */
import type { ReactNode } from "react";

export interface NavItem {
  /** Texto exibido no menu. */
  label: string;
  /** Destino: rota interna do site. */
  href: string;
  /** Quando true, item é renderizado com cor de destaque (acento). */
  destaque?: boolean;
  /** Emoji/decorador opcional exibido antes do label. */
  icone?: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Ofertas", href: "/ofertas", destaque: true, icone: "🔥" },
  { label: "Matérias", href: "/materias" },
  { label: "Produtos", href: "/produtos" },
  { label: "Top 10", href: "/top-10" },
];

/** Itens secundários (institucional) — exibidos no drawer mobile, abaixo da nav primária. */
export const NAV_ITEMS_INSTITUCIONAL: NavItem[] = [
  { label: "Seções", href: "/secoes" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];
