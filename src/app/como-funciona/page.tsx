import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIAS } from "@/lib/categorias";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Como funciona o Unidicas",
  description: "Como avaliamos produtos, de onde vem nossa receita e por que você pode confiar.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Transparência
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Como funciona o {SITE_NAME}
        </h1>
        <p className="text-lg text-text-soft">
          Quem somos, como avaliamos e como ganhamos dinheiro.
        </p>
      </header>

      <article className="prose-article">
        <h2>Quem somos</h2>
        <p>
          O <strong>{SITE_NAME}</strong> é um site de reviews e comparativos
          independente, focado em ajudar você a comprar com mais confiança.
          Analisamos produtos das principais categorias —{" "}
          {CATEGORIAS.map((c, i) => (
            <span key={c.slug}>
              {i > 0 && (i === CATEGORIAS.length - 1 ? " e " : ", ")}
              <Link href={`/categorias/${c.slug}`}>{c.nome.toLowerCase()}</Link>
            </span>
          ))}
          .
        </p>

        <h2>Como avaliamos</h2>
        <p>
          Nossa metodologia combina <strong>testes práticos</strong>,{" "}
          <strong>comparação técnica de atributos</strong> e{" "}
          <strong>leitura de fontes especializadas</strong>. Para cada
          categoria, definimos os atributos mais relevantes e ranqueamos os
          produtos.
        </p>
        <p>
          Os principais critérios que usamos em quase todas as categorias:
        </p>
        <ul>
          <li>
            <strong>Custo-benefício:</strong> a relação entre o que o produto
            entrega e o preço cobrado.
          </li>
          <li>
            <strong>Desempenho:</strong> testes práticos e benchmarks quando
            aplicável.
          </li>
          <li>
            <strong>Confiabilidade:</strong> reputação da marca, garantia e
            histórico de suporte.
          </li>
          <li>
            <strong>Experiência de uso:</strong> ergonomia, software, design.
          </li>
        </ul>

        <h2>Como ganhamos dinheiro</h2>
        <p>
          Alguns links do site são de <strong>afiliados</strong> de marketplaces
          como Mercado Livre, Amazon, Shopee e Magalu. Quando você clica em
          "Ver oferta" e efetua uma compra, podemos receber uma pequena
          comissão — <strong>sem custo extra para você</strong>.
        </p>
        <p>
          É importante deixar isso claro: <strong>o fato de termos um link de
          afiliado não influencia nossa nota</strong>. A avaliação é feita
          antes de qualquer link de afiliação, e somos transparentes quando
          recebemos amostras para análise.
        </p>

        <h2>Como você pode usar o site</h2>
        <ul>
          <li>
            <Link href="/materias">Matérias</Link> — comparativos longos,
            guias de compra e análises aprofundadas.
          </li>
          <li>
            <Link href="/reviews">Reviews</Link> — fichas técnicas de cada
            produto com prós, contras e nota.
          </li>
          <li>
            <Link href="/categorias">Categorias</Link> — agrupadas por tipo de
            produto, com ranking automático.
          </li>
          <li>
            <Link href="/produtos">Catálogo</Link> — todos os produtos
            analisados em um só lugar.
          </li>
        </ul>

        <h2>Tem uma sugestão?</h2>
        <p>
          Adoramos ouvir dos leitores. Sugestões de novos produtos para
          analisar, correções ou parcerias:{" "}
          <Link href="/contato">fale conosco</Link>.
        </p>
      </article>
    </div>
  );
}
