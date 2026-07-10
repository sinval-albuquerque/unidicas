"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CategoryDropdown } from "./CategoryDropdown";
import { NAV_ITEMS, NAV_ITEMS_INSTITUCIONAL } from "@/lib/nav";

interface MobileNavProps {
  aberto: boolean;
  onFechar: () => void;
}

/**
 * Drawer de navegação mobile. Renderizado dentro do Header e controlado
 * por um único estado de "drawer aberto" no NavBar.
 *
 * - Slide-in da esquerda
 * - Backdrop escuro com clique para fechar
 * - Trava scroll do <body> quando aberto
 * - Fecha com Escape
 * - Inclui a nav principal + CategoryDropdown na variante mobile (acordeão)
 *
 * A lista de links vem de `NAV_ITEMS` e `NAV_ITEMS_INSTITUCIONAL` —
 * mesma fonte que `NavBar` (desktop).
 */
export function MobileNav({ aberto, onFechar }: MobileNavProps) {
  // Trava o scroll do body quando o drawer está aberto
  useEffect(() => {
    if (!aberto) return;
    const html = document.documentElement;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevScrollbarGap = window.innerWidth - html.clientWidth;
    body.style.overflow = "hidden";
    if (prevScrollbarGap > 0) {
      body.style.paddingRight = `${prevScrollbarGap}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = "";
    };
  }, [aberto]);

  // Fecha com Escape
  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  return (
    <div
      aria-hidden={!aberto}
      className={`fixed inset-0 z-[60] md:hidden ${
        aberto ? "" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`absolute top-0 left-0 h-full w-[85vw] max-w-sm bg-bg border-r border-border shadow-xl flex flex-col transform transition-transform duration-200 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-bold uppercase tracking-wider text-text">
            Menu
          </span>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-soft hover:bg-bg-alt hover:text-primary transition cursor-pointer"
          >
            <svg
              aria-hidden
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M4 4 L14 14 M14 4 L4 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onFechar}
              className={
                item.destaque
                  ? "flex items-center gap-2 px-4 py-3 text-sm font-extrabold text-accent bg-accent-soft hover:bg-accent/20 rounded-lg no-underline transition"
                  : "block px-4 py-3 text-sm font-semibold text-text-soft hover:text-primary hover:bg-bg-alt rounded-lg no-underline transition"
              }
            >
              {item.icone && <span aria-hidden>{item.icone}</span>}
              {item.label}
            </Link>
          ))}

          {/* Acordeão de categorias dentro do drawer */}
          <CategoryDropdown variant="mobile" onNavigate={onFechar} />

          <div className="my-3 border-t border-border" />

          {NAV_ITEMS_INSTITUCIONAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onFechar}
              className="block px-4 py-2.5 text-sm text-text-soft hover:text-primary hover:bg-bg-alt rounded-lg no-underline transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
