"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryDropdown } from "./CategoryDropdown";
import { MobileNav } from "./MobileNav";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Barra de navegação do header — client component.
 *
 * Renderiza dois layouts no mesmo local:
 * - <md: hambúrguer que abre o drawer MobileNav
 * - md+: nav horizontal com CategoryDropdown (popover)
 *
 * Mantém o estado de "drawer aberto" aqui para que o botão e o
 * drawer compartilhem a mesma fonte de verdade.
 *
 * A lista de links primários vem de `NAV_ITEMS` (src/lib/nav.ts) —
 * ver também `MobileNav`, que reusa o mesmo array.
 */
export function NavBar() {
  const [drawerAberto, setDrawerAberto] = useState(false);

  return (
    <>
      {/* ===== Desktop (md+) ===== */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link
          href="/"
          className="text-text-soft hover:text-primary no-underline"
        >
          Início
        </Link>
        <CategoryDropdown variant="desktop" />
        {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              item.destaque
                ? "inline-flex items-center gap-1 text-accent hover:text-accent/80 font-extrabold no-underline transition"
                : "text-text-soft hover:text-primary no-underline"
            }
          >
            {item.icone && <span aria-hidden>{item.icone}</span>}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ===== Mobile (<md) ===== */}
      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/produtos"
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-3 py-2 rounded-lg no-underline transition"
        >
          Ver catálogo
        </Link>
        <button
          type="button"
          onClick={() => setDrawerAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={drawerAberto}
          aria-controls="mobile-nav-drawer"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-text hover:bg-bg-alt border border-border cursor-pointer transition"
        >
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M3 6 H17 M3 10 H17 M3 14 H17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Drawer mobile (compartilhado) */}
      <MobileNav
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
      />
    </>
  );
}
