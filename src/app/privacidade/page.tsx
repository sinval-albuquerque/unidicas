import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Política de Privacidade
        </h1>
        <p className="text-sm text-text-muted">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </header>

      <article className="prose-article">
        <p>
          Esta política descreve como o <strong>{SITE_NAME}</strong> (
          {SITE_URL}) coleta, usa e protege as informações dos seus usuários.
        </p>

        <h2>1. Dados que coletamos</h2>
        <p>
          Coletamos dados de navegação de forma automática, por meio de cookies
          e ferramentas de analytics. Esses dados incluem: páginas visitadas,
          tempo na página, dispositivo, navegador e país de origem.
        </p>
        <p>
          Não coletamos dados pessoais identificáveis (nome, email, telefone)
          a menos que você os envie voluntariamente, por exemplo, pelo
          formulário de contato.
        </p>

        <h2>2. Cookies</h2>
        <p>
          Usamos cookies para analisar o tráfego e melhorar a experiência. Você
          pode desativar os cookies nas configurações do seu navegador sem
          prejuízo de uso do site.
        </p>

        <h2>3. Links de afiliados</h2>
        <p>
          Alguns links do site são de programas de afiliados (Amazon, Mercado
          Livre, etc.). Quando você clica e efetua uma compra, podemos receber
          uma comissão. Isso não altera o preço para você.
        </p>

        <h2>4. Compartilhamento de dados</h2>
        <p>
          Não vendemos, alugamos ou compartilhamos seus dados pessoais com
          terceiros, exceto quando exigido por lei.
        </p>

        <h2>5. Seus direitos (LGPD)</h2>
        <p>
          Você tem direito a acessar, corrigir ou solicitar a exclusão dos
          seus dados pessoais. Para exercer esses direitos, entre em contato
          pelo email indicado na nossa página de contato.
        </p>

        <h2>6. Segurança</h2>
        <p>
          Adotamos medidas técnicas razoáveis para proteger as informações
          dos usuários. Nenhum sistema é 100% seguro, mas trabalhamos para
          minimizar riscos.
        </p>

        <h2>7. Alterações nesta política</h2>
        <p>
          Esta política pode ser atualizada periodicamente. A data da última
          atualização está indicada no topo desta página.
        </p>
      </article>
    </div>
  );
}
