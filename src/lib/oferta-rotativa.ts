import type { Oferta } from "@/types/oferta";

/** Janela padrão de rotação (30 minutos). */
export const JANELA_ROTACAO_MS = 30 * 60 * 1000;

/**
 * Seletor determinístico baseado em tempo.
 *
 * Dada uma lista de ofertas, retorna aquela que deve aparecer **agora**
 * segundo a janela de rotação. Mesmo instante → mesma oferta (idempotente).
 *
 * Algoritmo:
 *   slot = Math.floor(timestampMs / janelaMs)
 *   idx  = slot % pool.length
 *   out  = pool[idx]
 *
 * Retorna `undefined` se o pool estiver vazio (caller decide o fallback).
 */
export function selecionarOfertaRotativa(
  pool: readonly Oferta[],
  timestampMs: number,
  janelaMs: number = JANELA_ROTACAO_MS,
): Oferta | undefined {
  if (pool.length === 0) return undefined;
  if (janelaMs <= 0) return pool[0];
  const slot = Math.floor(timestampMs / janelaMs);
  const idx = ((slot % pool.length) + pool.length) % pool.length;
  return pool[idx];
}

/** Retorna quantos ms faltam para a próxima rotação (>= 0, < janelaMs). */
export function msAteProximaRotacao(
  timestampMs: number,
  janelaMs: number = JANELA_ROTACAO_MS,
): number {
  if (janelaMs <= 0) return 0;
  return janelaMs - (timestampMs % janelaMs);
}
