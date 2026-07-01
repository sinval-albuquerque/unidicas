import { describe, it, expect } from "vitest";
import { ordenarPorAtributo, obterMelhorPorAtributo, obterTabelaComparativa } from "@/lib/comparacoes";
import { obterCategoria } from "@/lib/categorias";
import type { AtributoComparacao, Review } from "@/types/review";

const reviews: Review[] = [
  {
    slug: "gamer", titulo: "Gamer", produto: "Gamer", categoria: "notebooks",
    nota: 4.5, imagem: "", marketplace: "Amazon", preco: 4299, linkAfiliado: "#",
    pros: [], contras: [], resumo: "", emDestaque: false,
    atributos: { memoria: 16, bateria: 6, preco: 4299 }, conteudo: "",
  },
  {
    slug: "ultrabook", titulo: "Ultrabook", produto: "Ultrabook", categoria: "notebooks",
    nota: 4.7, imagem: "", marketplace: "ML", preco: 3899, linkAfiliado: "#",
    pros: [], contras: [], resumo: "", emDestaque: false,
    atributos: { memoria: 8, bateria: 18, preco: 3899 }, conteudo: "",
  },
  {
    slug: "workstation", titulo: "WS", produto: "WS", categoria: "notebooks",
    nota: 4.6, imagem: "", marketplace: "Magalu", preco: 7999, linkAfiliado: "#",
    pros: [], contras: [], resumo: "", emDestaque: false,
    atributos: { memoria: 32, bateria: 7, preco: 7999 }, conteudo: "",
  },
];

const attrBateria: AtributoComparacao = { id: "bateria", label: "Bateria", unidade: "h", maiorMelhor: true };
const attrPreco: AtributoComparacao = { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false };
const attrMemoria: AtributoComparacao = { id: "memoria", label: "RAM", unidade: "GB", maiorMelhor: true };

describe("ordenarPorAtributo", () => {
  it("ordena por bateria (maior melhor) decrescente", () => {
    const r = ordenarPorAtributo(reviews, attrBateria);
    expect(r.map((x) => x.slug)).toEqual(["ultrabook", "workstation", "gamer"]);
  });

  it("ordena por preço (menor melhor) crescente", () => {
    const r = ordenarPorAtributo(reviews, attrPreco);
    expect(r.map((x) => x.slug)).toEqual(["ultrabook", "gamer", "workstation"]);
  });

  it("ordena por memória (maior melhor) decrescente", () => {
    const r = ordenarPorAtributo(reviews, attrMemoria);
    expect(r.map((x) => x.slug)).toEqual(["workstation", "gamer", "ultrabook"]);
  });

  it("não muta a entrada", () => {
    const copia = [...reviews];
    ordenarPorAtributo(reviews, attrBateria);
    expect(reviews).toEqual(copia);
  });
});

describe("obterMelhorPorAtributo", () => {
  it("retorna o vencedor correto para bateria", () => {
    const m = obterMelhorPorAtributo(reviews, attrBateria);
    expect(m?.review.slug).toBe("ultrabook");
    expect(m?.valor).toBe(18);
  });

  it("retorna o vencedor correto para preço (menor)", () => {
    const m = obterMelhorPorAtributo(reviews, attrPreco);
    expect(m?.review.slug).toBe("ultrabook");
    expect(m?.valor).toBe(3899);
  });

  it("retorna undefined para lista vazia", () => {
    expect(obterMelhorPorAtributo([], attrBateria)).toBeUndefined();
  });
});

describe("obterTabelaComparativa", () => {
  it("retorna undefined para categoria inexistente", () => {
    expect(obterTabelaComparativa("inexistente")).toBeUndefined();
  });

  it("constrói tabela com linhas e vencedores", () => {
    const tabela = obterTabelaComparativa("notebooks", reviews);
    expect(tabela).toBeDefined();
    expect(tabela!.reviews).toHaveLength(3);
    expect(tabela!.linhas.length).toBeGreaterThan(0);

    const linhaBateria = tabela!.linhas.find((l) => l.atributo.id === "bateria");
    expect(linhaBateria).toBeDefined();
    const vencedor = linhaBateria!.valores.find((v) => v.vencedor);
    expect(vencedor?.review.slug).toBe("ultrabook");
  });
});