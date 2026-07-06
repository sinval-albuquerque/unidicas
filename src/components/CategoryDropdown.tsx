"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CATEGORIAS } from "@/lib/categorias";
import { obterSecaoDaCategoria } from "@/lib/secoes";

interface CategoryDropdownProps {
  /**
   * Notifica o componente pai sempre que o usuário escolhe um link.
   * Usado pelo drawer mobile para fechar o menu após navegação.
   */
  onNavigate?: () => void;
  /**
   * Variante visual. "desktop" = popover com fundo branco, posicionado
   * abaixo do botão. "mobile" = acordeão expansível, sem popover.
   */
  variant?: "desktop" | "mobile";
}

/**
 * Dropdown / acordeão de Categorias para o header.
 *
 * Desktop (variant="desktop"):
 *  - Popover absoluto abaixo do botão "Categorias"
 *  - Abre com Enter/Space/ArrowDown; fecha com Esc/clique fora/navegação
 *
 * Mobile (variant="mobile"):
 *  - Acordeão expansível; empilhado no drawer
 *  - Toggle por clique; estado controlado internamente
 */
export function CategoryDropdown({
  onNavigate,
  variant = "desktop",
}: CategoryDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Fecha ao clicar fora (apenas desktop)
  useEffect(() => {
    if (!aberto || variant !== "desktop") return;
    function onClickFora(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, [aberto, variant]);

  // Fecha com Escape e devolve foco ao botão (apenas desktop)
  useEffect(() => {
    if (!aberto || variant !== "desktop") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, variant]);

  function handleTeclaBotao(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (variant !== "desktop") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberto(true);
    }
  }

  function handleClickLink() {
    setAberto(false);
    onNavigate?.();
  }

  const isMobile = variant === "mobile";

  return (
    <div ref={containerRef} className={isMobile ? "w-full" : "relative"}>
      <button
        ref={botaoRef}
        type="button"
        aria-haspopup={isMobile ? false : "menu"}
        aria-expanded={aberto}
        aria-controls={isMobile ? undefined : menuId}
        onClick={() => setAberto((v) => !v)}
        onKeyDown={handleTeclaBotao}
        className={
          isMobile
            ? "flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text-soft hover:text-primary hover:bg-bg-alt rounded-lg transition cursor-pointer"
            : "flex items-center gap-1 text-text-soft hover:text-primary transition cursor-pointer"
        }
      >
        <span>Categorias</span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${
            aberto ? "rotate-180" : ""
          } ${isMobile ? "ml-2" : ""}`}
        >
          <path
            d="M3 4.5 L6 7.5 L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Desktop: popover absoluto */}
      {!isMobile && aberto && (
        <div
          id={menuId}
          role="menu"
          aria-label="Todas as categorias"
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-bg border border-border rounded-xl shadow-lg overflow-hidden z-50 fade-in"
        >
          <Link
            href="/categorias"
            role="menuitem"
            onClick={handleClickLink}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary border-b border-border hover:bg-bg-alt no-underline transition"
          >
            Ver todas as categorias
            <span aria-hidden>→</span>
          </Link>

          <ul className="py-1 max-h-[70vh] overflow-y-auto">
            {CATEGORIAS.map((c) => {
              const secao = obterSecaoDaCategoria(c.slug);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    role="menuitem"
                    onClick={handleClickLink}
                    className="flex items-start gap-3 px-4 py-2.5 text-sm text-text-soft hover:bg-bg-alt hover:text-primary no-underline transition"
                  >
                    {secao && (
                      <span
                        aria-hidden
                        className="mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-md text-base shrink-0 border"
                        style={{
                          color: secao.cor,
                          backgroundColor: secao.corLight,
                          borderColor: secao.cor,
                        }}
                      >
                        {secao.icone}
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-text">
                        {c.nome}
                      </span>
                      {secao && (
                        <span
                          className="block text-[0.7rem] font-bold uppercase tracking-wide mt-0.5"
                          style={{ color: secao.cor }}
                        >
                          {secao.nome}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mobile: acordeão expansível (empilhado) */}
      {isMobile && aberto && (
        <div
          id={menuId}
          role="region"
          aria-label="Todas as categorias"
          className="mt-1 ml-2 pl-3 border-l border-border space-y-1 fade-in"
        >
          <Link
            href="/categorias"
            onClick={handleClickLink}
            className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-bg-alt rounded-md no-underline transition"
          >
            Ver todas as categorias →
          </Link>
          {CATEGORIAS.map((c) => {
            const secao = obterSecaoDaCategoria(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                onClick={handleClickLink}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-soft hover:bg-bg-alt hover:text-primary rounded-md no-underline transition"
              >
                {secao && (
                  <span
                    aria-hidden
                    className="inline-flex w-5 h-5 items-center justify-center rounded text-xs shrink-0 border"
                    style={{
                      color: secao.cor,
                      backgroundColor: secao.corLight,
                      borderColor: secao.cor,
                    }}
                  >
                    {secao.icone}
                  </span>
                )}
                <span className="flex-1">{c.nome}</span>
                {secao && (
                  <span
                    className="text-[0.6rem] font-bold uppercase tracking-wide"
                    style={{ color: secao.cor }}
                  >
                    {secao.nome}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
