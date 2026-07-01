import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIAS } from "@/lib/categorias";

export const metadata: Metadata = {
  title: "Como adicionar produtos aqui no chat",
  description:
    "Aprenda a pedir para o Copilot adicionar um novo produto no Unidicas em segundos.",
};

export default function AdicionarProdutoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          <span aria-hidden>✨</span> Guia rápido
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Como adicionar produtos aqui no chat
        </h1>
        <p className="text-lg text-text-soft">
          Em segundos, peça para o Copilot cadastrar um novo produto. Não
          precisa mexer em código.
        </p>
      </header>

      <article className="prose-article">
        <h2>O jeito mais rápido</h2>
        <p>
          Abra o chat do Copilot no VS Code (ou no GitHub) e digite um pedido
          em português, do tipo:
        </p>
        <pre>
{`Adicione o produto: iPhone 16 Pro
- Categoria: celulares
- Nota: 4.7
- Preço: R$ 9.499
- Preço original: R$ 10.999
- Marketplace: Mercado Livre
- Link: https://...
- Imagem: https://...
- Prós: câmera top, chip A18 Pro, tela 120Hz
- Contras: caro
- Resumo: o melhor iPhone já feito`}
        </pre>
        <p>
          O Copilot vai criar o arquivo{" "}
          <code>src/content/reviews/iphone-16-pro.mdx</code> com tudo
          preenchido, validar a categoria, gerar o slug em kebab-case e avisar
          quando estiver pronto.
        </p>

        <h2>Comandos que funcionam</h2>
        <ul>
          <li>
            <code>adicione o produto [nome]</code>
          </li>
          <li>
            <code>crie uma review do [nome]</code>
          </li>
          <li>
            <code>cadastre [nome] com link [url]</code>
          </li>
          <li>
            <code>crie uma matéria sobre [tema]</code>
          </li>
          <li>
            <code>liste os produtos cadastrados</code>
          </li>
          <li>
            <code>edite a review do [nome]</code>
          </li>
          <li>
            <code>delete o produto [nome]</code>
          </li>
        </ul>

        <h2>Se der só o nome</h2>
        <p>
          Sem problema. O Copilot vai preencher o resto com placeholders
          inteligentes (imagem do Unsplash, link de exemplo, prós/contras
          genéricos) e deixar você editar depois.
        </p>

        <h2>Como o produto aparece no site</h2>
        <p>Depois de criado, o produto aparece automaticamente em:</p>
        <ul>
          <li>
            <Link href="/produtos">Catálogo geral</Link>
          </li>
          <li>
            <Link href="/top-10">Top 10</Link> (se a nota for alta)
          </li>
          <li>
            <Link href="/reviews">Página individual de review</Link>{" "}
            (exemplo: <code>/reviews/fone-bluetooth-anc</code>)
          </li>
          <li>
            Páginas de{" "}
            {CATEGORIAS.map((c, i) => (
              <span key={c.slug}>
                {i > 0 && (i === CATEGORIAS.length - 1 ? " e " : ", ")}
                <Link href={`/categorias/${c.slug}`}>{c.nome.toLowerCase()}</Link>
              </span>
            ))}
          </li>
        </ul>

        <h2>Categorias disponíveis</h2>
        <ul>
          {CATEGORIAS.map((c) => (
            <li key={c.slug}>
              <code>{c.slug}</code> — {c.nome}
            </li>
          ))}
        </ul>

        <h2>Inserir produtos em uma matéria</h2>
        <p>
          Dentro de uma matéria em{" "}
          <code>src/content/materias/&lt;slug&gt;.mdx</code>, você pode usar
          três componentes para exibir produtos:
        </p>
        <pre>
{`<ProductCallout title="iPhone 15" href="..." price={6499} marketplace="Amazon">
  Descrição do produto.
</ProductCallout>

<ProductGrid ids={["fone-bluetooth-anc", "fone-studio-qualidade"]} titulo="Veja também" />

<ProductList categoria="notebooks" limite={5} titulo="Top 5 notebooks" />`}
        </pre>

        <h2>Precisa de ajuda?</h2>
        <p>
          Se tiver dúvida ou quiser um comando personalizado, é só me chamar
          aqui no chat. <Link href="/contato">Ou use a página de contato</Link>
          {" "}para falar com a equipe.
        </p>
      </article>
    </div>
  );
}
