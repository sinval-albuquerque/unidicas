"use client";

import { useState, useEffect } from "react";

/** Barra de busca client-side com debounce de 250ms. */
export function SearchBar({
  onBuscar,
  placeholder = "Buscar reviews, produtos, ofertas...",
  debounceMs = 250,
}: {
  onBuscar: (termo: string) => void;
  placeholder?: string;
  debounceMs?: number;
}) {
  const [termo, setTermo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onBuscar(termo), debounceMs);
    return () => clearTimeout(t);
  }, [termo, onBuscar, debounceMs]);

  return (
    <div className="relative flex-1 max-w-md">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar reviews"
        className="w-full pl-11 pr-4 py-2.5 border-2 border-border rounded-lg text-sm outline-none focus:border-primary transition"
      />
    </div>
  );
}