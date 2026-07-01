import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a equipe do Unidicas.",
};

export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Fale com a gente
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Contato
        </h1>
        <p className="text-lg text-text-soft">
          Sugestões, parcerias, correções ou imprensa.
        </p>
      </header>

      <article className="prose-article">
        <h2>Para leitores</h2>
        <p>
          Tem uma sugestão de matéria, encontrou um erro em uma review ou quer
          pedir uma análise? Envie sua mensagem para:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:contato@unidicas.com.br">contato@unidicas.com.br</a>
        </p>

        <h2>Para marcas e parcerias</h2>
        <p>
          Recebemos amostras para análise, mas isso <strong>não</strong>{" "}
          garante review positiva nem influencia nossa nota. Para propostas
          comerciais:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:parcerias@unidicas.com.br">
            parcerias@unidicas.com.br
          </a>
        </p>

        <h2>Imprensa</h2>
        <p>
          Para entrevistas ou material de imprensa, escreva para:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:imprensa@unidicas.com.br">
            imprensa@unidicas.com.br
          </a>
        </p>

        <h2>Tempo de resposta</h2>
        <p>
          Respondemos em até 3 dias úteis. Se for urgente, indique no assunto
          do email.
        </p>
      </article>
    </div>
  );
}
