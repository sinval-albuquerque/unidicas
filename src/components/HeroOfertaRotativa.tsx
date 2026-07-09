"use client";

import { useEffect, useState } from "react";
import { CATEGORIA_POR_SLUG } from "@/lib/categorias";
import {
  JANELA_ROTACAO_MS,
  msAteProximaRotacao,
  selecionarOfertaRotativa,
} from "@/lib/oferta-rotativa";
import type { Oferta } from "@/types/oferta";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/** BRL sem casas decimais (R$ 1.997). */
const brl = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

interface Props {
  /** Pool de ofertas candidatas a rotacionar (já filtradas, sem undefined). */
  pool: Oferta[];
  /** Fallback usado enquanto o client hidrata (mesma semântica do SSR). */
  fallback: Oferta | null;
}

type SlotTick = { ts: number; msToNext: number };

/**
 * Card "em destaque" do Hero com rotação automática a cada 30 minutos.
 *
 * Por que client-side:
 *  - O site é estático (SSG). A oferta precisa "mudar" no navegador do
 *    usuário a cada janela, sem rebuild nem request ao servidor.
 *  - Função pura (`selecionarOfertaRotativa`) roda igual no SSR e no
 *    client — sem flash, sem hydration mismatch.
 */
export function HeroOfertaRotativa({ pool, fallback }: Props) {
  // Estado inicial: usa o fallback do server (que veio do mesmo cálculo
  // puro, então casa exatamente com o primeiro tick do client).
  const [oferta, setOferta] = useState<Oferta | null>(fallback);

  useEffect(() => {
    if (pool.length === 0) return;

    function tick() {
      const ts = Date.now();
      const next = selecionarOfertaRotativa(pool, ts, JANELA_ROTACAO_MS);
      if (next) setOferta(next);
    }

    // Roda imediatamente para sincronizar com o tempo real do navegador
    // (pode diferir de quando o SSR foi gerado).
    tick();

    // Alinha o próximo tick com o "fronteira" da janela para todos
    // os usuários rodarem o setInterval no mesmo ritmo.
    const initial: SlotTick = {
      ts: Date.now(),
      msToNext: msAteProximaRotacao(Date.now(), JANELA_ROTACAO_MS),
    };

    const alignTimer = window.setTimeout(() => {
      tick();
      window.setInterval(tick, JANELA_ROTACAO_MS);
    }, initial.msToNext);

    return () => window.clearTimeout(alignTimer);
  }, [pool]);

  const categoriaLabel = oferta
    ? CATEGORIA_POR_SLUG[oferta.categoria as keyof typeof CATEGORIA_POR_SLUG]?.nome ??
      oferta.categoria
    : "Notebook";

  const desconto = oferta?.precoOriginal
    ? Math.round(((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100)
    : 19;

  const nota = oferta?.nota ?? 4.6;
  const ratingWidth = Math.max(0, Math.min(100, Math.round((nota / 5) * 100)));

  return (
    <div className="lg:col-span-5 hidden lg:block">
      <div className="relative">
        {/* Card principal */}
        <div className="relative bg-bg border border-border rounded-2xl shadow-pop p-6 hover-lift">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-accent-soft text-accent text-[0.65rem] font-extrabold rounded uppercase tracking-wider">
              Em destaque
            </span>
            <span className="text-xs text-text-muted">{categoriaLabel}</span>
          </div>
          <h3 className="text-lg font-bold mb-1.5">
            {oferta ? oferta.titulo : "Notebook Gamer RTX 4060"}
          </h3>
          <p className="text-sm text-text-soft mb-4">
            {oferta
              ? oferta.resumo
              : "RTX 4060 + 16GB RAM + 512GB SSD. Bom custo-benefício para jogos 1080p."}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold">
              R$ {oferta ? brl(oferta.preco) : "5.499"}
            </span>
            {oferta?.precoOriginal ? (
              <span className="text-sm text-text-muted line-through">
                R$ {brl(oferta.precoOriginal)}
              </span>
            ) : (
              <span className="text-sm text-text-muted line-through">R$ 6.799</span>
            )}
            <span className="ml-auto text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded">
              -{desconto}%
            </span>
          </div>
          <div className="h-1.5 bg-bg-gray rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700"
              style={{ width: `${ratingWidth}%` }}
            />
          </div>
          {oferta ? (
            <a
              key={oferta.slug}
              href={oferta.linkAfiliado}
              target="_blank"
              rel={EXTERNAL_LINK_REL}
              className="block w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2.5 rounded-lg transition text-center no-underline"
            >
              Ver oferta →
            </a>
          ) : (
            <button className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2.5 rounded-lg transition">
              Ver oferta →
            </button>
          )}
        </div>

        {/* Card secundário flutuante */}
        <div
          className="absolute -top-6 -right-6 bg-bg border border-border rounded-xl shadow-floating p-3 w-44 float"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-success rounded-full pulse-dot" />
            <span className="text-[0.65rem] font-bold text-success uppercase">
              Atualizado
            </span>
          </div>
          <p className="text-xs font-semibold text-text leading-tight">
            Preço caiu {desconto}% nas últimas 24h
          </p>
        </div>

        {/* Badge flutuante */}
        <div
          className="absolute -bottom-4 -left-4 bg-bg-dark text-white rounded-xl shadow-pop px-3 py-2 float"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-[0.65rem] uppercase tracking-wider text-text-muted">Nota</p>
          <p className="text-xl font-extrabold">
            {nota.toFixed(1)} <span className="text-accent">★</span>
          </p>
        </div>
      </div>
    </div>
  );
}
