import { describe, it, expect } from "vitest";
import {
  JANELA_ROTACAO_MS,
  msAteProximaRotacao,
  selecionarOfertaRotativa,
} from "@/lib/oferta-rotativa";
import type { Oferta } from "@/types/oferta";

const ofertaBase = (slug: string): Oferta => ({
  slug,
  titulo: slug,
  produto: slug,
  categoria: "outros",
  preco: 100,
  precoOriginal: 200,
  imagem: "",
  marketplace: "Mercado Livre",
  linkAfiliado: "#",
  tags: [],
  emDestaque: true,
  nota: 4.5,
  resumo: "x",
  conteudo: "",
});

describe("selecionarOfertaRotativa", () => {
  it("retorna undefined para pool vazio", () => {
    expect(selecionarOfertaRotativa([], Date.now())).toBeUndefined();
  });

  it("retorna a primeira oferta com pool unitário, independente do tempo", () => {
    const pool = [ofertaBase("a")];
    expect(selecionarOfertaRotativa(pool, 0)?.slug).toBe("a");
    expect(selecionarOfertaRotativa(pool, Date.now())?.slug).toBe("a");
    expect(selecionarOfertaRotativa(pool, 1e15)?.slug).toBe("a");
  });

  it("é idempotente: mesmo instante => mesma oferta", () => {
    const pool = ["a", "b", "c"].map(ofertaBase);
    const t = 1_700_000_000_000;
    expect(selecionarOfertaRotativa(pool, t)?.slug).toBe(
      selecionarOfertaRotativa(pool, t)?.slug,
    );
  });

  it("rotaciona a cada janelaMs (3 ofertas, janela padrão de 30min)", () => {
    const pool = ["a", "b", "c"].map(ofertaBase);
    const base = 0;
    expect(selecionarOfertaRotativa(pool, base)?.slug).toBe("a");
    expect(selecionarOfertaRotativa(pool, base + JANELA_ROTACAO_MS)?.slug).toBe("b");
    expect(selecionarOfertaRotativa(pool, base + 2 * JANELA_ROTACAO_MS)?.slug).toBe("c");
    expect(selecionarOfertaRotativa(pool, base + 3 * JANELA_ROTACAO_MS)?.slug).toBe("a");
  });

  it("aceita janela customizada (1 minuto)", () => {
    const pool = ["a", "b"].map(ofertaBase);
    expect(selecionarOfertaRotativa(pool, 0, 60_000)?.slug).toBe("a");
    expect(selecionarOfertaRotativa(pool, 60_000, 60_000)?.slug).toBe("b");
    expect(selecionarOfertaRotativa(pool, 120_000, 60_000)?.slug).toBe("a");
  });

  it("cai para pool[0] se janelaMs for inválida (<=0)", () => {
    const pool = ["a", "b", "c"].map(ofertaBase);
    expect(selecionarOfertaRotativa(pool, 1e15, 0)?.slug).toBe("a");
    expect(selecionarOfertaRotativa(pool, 1e15, -10)?.slug).toBe("a");
  });

  it("instantes dentro da mesma janela retornam a mesma oferta", () => {
    const pool = ["a", "b", "c", "d"].map(ofertaBase);
    const t1 = 0;
    const t2 = JANELA_ROTACAO_MS - 1; // 1ms antes de virar a janela
    expect(selecionarOfertaRotativa(pool, t1)?.slug).toBe(
      selecionarOfertaRotativa(pool, t2)?.slug,
    );
  });
});

describe("msAteProximaRotacao", () => {
  it("retorna 0 para janela inválida", () => {
    expect(msAteProximaRotacao(1000, 0)).toBe(0);
    expect(msAteProximaRotacao(1000, -1)).toBe(0);
  });

  it("retorna tempo restante para a próxima fronteira", () => {
    const janela = 1000;
    expect(msAteProximaRotacao(0, janela)).toBe(1000);
    expect(msAteProximaRotacao(250, janela)).toBe(750);
    expect(msAteProximaRotacao(999, janela)).toBe(1);
    expect(msAteProximaRotacao(1000, janela)).toBe(1000);
  });
});
