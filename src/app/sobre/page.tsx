import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIAS } from "@/lib/categorias";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: `Como o ${SITE_NAME} avalia produtos, de onde vem a receita e por que você pode confiar.`,
};

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Sobre
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Sobre o {SITE_NAME}
        </h1>
        <p className="text-lg text-text-soft">
          Reviews honestas, ofertas reais e zero enrolação.
        </p>
      </header>

      <article className="prose-article">
        <p>
          O <strong>{SITE_NAME}</strong> nasceu para ajudar você a comprar
          certo. Testamos e analisamos produtos das principais categorias —
          {CATEGORIAS.map((c, i) => (
            <span key={c.slug}>
              {i > 0 && (i === CATEGORIAS.length - 1 ? " e " : ", ")}
              <Link href={`/categorias/${c.slug}`}>{c.nome.toLowerCase()}</Link>
            </span>
          ))}{" "}
          — e mostramos o link direto para a melhor oferta disponível.
        </p>

        <h2>Como avaliamos</h2>
        <p>
          Nossa metodologia combina testes práticos, comparação técnica de
          atributos e leitura de fontes especializadas. Para cada categoria,
          definimos os atributos mais relevantes (bateria, câmera, desempenho,
          preço) e ranqueamos os produtos vencedores.
        </p>
        <p>
          Quando um produto se destaca, dizemos. Quando não vale o preço,
          também dizemos. Não temos publieditorial disfarçado.
        </p>

        <h2>Como ganhamos dinheiro</h2>
        <p>
          Alguns links do site são de <strong>afiliados</strong>: quando você
          compra por eles, podemos receber uma pequena comissão — sem custo
          extra para você. É o que mantém o site no ar. As análises, porém,
          são independentes: o fato de termos um link de afiliado não
          influencia nossa nota.
        </p>

        <h2>O que você encontra aqui</h2>
        <ul>
          <li>
            <Link href="/materias">Matérias</Link> — comparativos longos,
            guias de compra e análises de mercado.
          </li>
          <li>
            <Link href="/reviews">Reviews</Link> — fichas técnicas de cada
            produto com prós, contras e nota.
          </li>
          <li>
            <Link href="/categorias">Categorias</Link> — agrupadas por tipo
            de produto, com ranking automático.
          </li>
        </ul>

        <h2>Contato</h2>
        <p>
          Sugestões, parcerias ou correções? Fale com a gente pela{" "}
          <Link href="/contato">página de contato</Link>.
        </p>
      </article>
    </div>
  );
}
