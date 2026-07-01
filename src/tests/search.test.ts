import { describe, it, expect } from "vitest";
import { filtrarReviews } from "@/lib/search";
import type { Review } from "@/types/review";

const reviews: Review[] = [
  {
    slug: "a", titulo: "Fone Bluetooth ANC", produto: "Fone", categoria: "fones",
    nota: 4.8, imagem: "", marketplace: "Amazon", preco: 299, linkAfiliado: "#",
    pros: [], contras: [], resumo: "Som imersivo", emDestaque: true, atributos: {}, conteudo: "",
  },
  {
    slug: "b", titulo: "Notebook Gamer", produto: "Notebook", categoria: "notebooks",
    nota: 4.5, imagem: "", marketplace: "Amazon", preco: 4299, linkAfiliado: "#",
    pros: [], contras: [], resumo: "Roda tudo", emDestaque: false, atributos: {}, conteudo: "",
  },
];

describe("filtrarReviews", () => {
  it("retorna todas quando termo é vazio", () => {
    expect(filtrarReviews(reviews, "")).toHaveLength(2);
    expect(filtrarReviews(reviews, "   ")).toHaveLength(2);
  });

  it("filtra por título (case-insensitive)", () => {
    expect(filtrarReviews(reviews, "fone")).toHaveLength(1);
    expect(filtrarReviews(reviews, "FONE")).toHaveLength(1);
  });

  it("filtra por categoria", () => {
    expect(filtrarReviews(reviews, "notebooks")).toHaveLength(1);
  });

  it("filtra por resumo", () => {
    expect(filtrarReviews(reviews, "imersivo")).toHaveLength(1);
  });

  it("retorna vazio quando não há match", () => {
    expect(filtrarReviews(reviews, "xyz")).toHaveLength(0);
  });

  it("não muta a entrada", () => {
    const copia = [...reviews];
    filtrarReviews(reviews, "fone");
    expect(reviews).toEqual(copia);
  });
});