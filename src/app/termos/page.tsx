import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras de uso do site Unidicas.",
};

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Termos de Uso
        </h1>
        <p className="text-sm text-text-muted">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </header>

      <article className="prose-article">
        <p>
          Ao acessar o <strong>{SITE_NAME}</strong> ({SITE_URL}), você
          concorda com os termos descritos abaixo.
        </p>

        <h2>1. Conteúdo</h2>
        <p>
          Todas as reviews, comparativos e matérias são produzidos pela equipe
          do {SITE_NAME} ou por colaboradores identificados. O conteúdo é
          informativo e reflete a opinião dos autores.
        </p>

        <h2>2. Preços e disponibilidade</h2>
        <p>
          Os preços exibidos no site são indicativos e podem variar sem aviso
          prévio. A compra é feita no site do marketplace parceiro; verifique
          o valor final antes de finalizar o pedido.
        </p>

        <h2>3. Links de afiliados</h2>
        <p>
          O site participa de programas de afiliados. Algumas compras feitas
          pelos nossos links podem gerar comissão, sem custo adicional para
          você. Isso não influencia nossas análises.
        </p>

        <h2>4. Limitação de responsabilidade</h2>
        <p>
          Nos esforçamos para manter as informações corretas e atualizadas,
          mas não garantimos precisão absoluta. Use o conteúdo como apoio à
          decisão, não como única fonte.
        </p>

        <h2>5. Propriedade intelectual</h2>
        <p>
          Todo o conteúdo do site (textos, imagens, layout) é protegido por
          direitos autorais. É proibida a reprodução total ou parcial sem
          autorização prévia.
        </p>

        <h2>6. Conduta do usuário</h2>
        <p>
          É proibido usar o site para fins ilegais, difamatórios, ou que
          comprometam a segurança de outros usuários.
        </p>

        <h2>7. Alterações</h2>
        <p>
          Podemos atualizar estes termos a qualquer momento. A versão mais
          recente estará sempre disponível nesta página.
        </p>
      </article>
    </div>
  );
}
