import Image from "next/image";
import type { Oferta } from "@/types/oferta";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

interface OfertaVaridade {
  nome: string;
  imagem: string;
  desconto: number;
  caracteristicas: string[];
  link: string;
}

/**
 * Card de oferta no estilo JC Concursos — usado dentro do corpo do artigo.
 * Mostra uma variante do produto com badge de desconto, imagem, lista de
 * características e CTA "Ir à Loja".
 *
 * Uso no MDX:
 *   <OfertaVariante
 *     nome="Caixa JBL Boombox 4 - Azul"
 *     imagem="https://..."
 *     desconto={39}
 *     caracteristicas={["Até 34h de bateria", "JBL Pro com IA Sound", ...]}
 *     link="https://..."
 *   />
 */
export function OfertaVariante({
  nome,
  imagem,
  desconto,
  caracteristicas,
  link,
}: OfertaVaridade) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-bg not-prose mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Imagem */}
        <div className="md:col-span-4 relative aspect-4/3 md:aspect-auto md:min-h-50 bg-bg-gray flex items-center justify-center p-4">
          {imagem ? (
            <Image
              src={imagem}
              alt={nome}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain p-2"
            />
          ) : (
            <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
              {nome}
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="md:col-span-8 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base md:text-lg font-bold text-text leading-snug">
                <a
                  href={link}
                  target="_blank"
                  rel={EXTERNAL_LINK_REL}
                  className="text-text hover:text-primary no-underline transition"
                >
                  {nome}
                </a>
              </h3>
              <div className="shrink-0 text-center">
                <span className="block text-2xl md:text-3xl font-extrabold text-danger leading-none">
                  {desconto}%
                </span>
                <span className="block text-[0.6rem] uppercase tracking-widest text-danger font-bold">
                  DESCONTO
                </span>
              </div>
            </div>

            <ul className="space-y-1 mb-4">
              {caracteristicas.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-text-soft flex items-start gap-2"
                >
                  <span className="text-primary mt-1 shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={link}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="inline-block self-start bg-success hover:bg-success-dark text-white font-bold text-sm px-6 py-2.5 rounded-lg transition no-underline"
          >
            Ir à Loja →
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Card de oferta no estilo "ficha do produto" — usado no topo da página de detalhe.
 * Mostra o produto principal com preço, desconto, imagem e CTA.
 */
export function OfertaHeroCard({ oferta }: { oferta: Oferta }) {
  const desconto =
    oferta.precoOriginal && oferta.precoOriginal > oferta.preco
      ? Math.round(
          ((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100,
        )
      : 0;
  const parcela =
    oferta.preco >= 12
      ? Math.max(1, Math.floor(oferta.preco / 12))
      : oferta.preco;

  return (
    <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-floating not-prose mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Imagem */}
        <div className="md:col-span-5 relative aspect-4/3 md:aspect-auto md:min-h-70 bg-bg-gray flex items-center justify-center p-6">
          {oferta.imagem ? (
            <Image
              src={oferta.imagem}
              alt={oferta.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain p-4"
            />
          ) : (
            <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
              {oferta.produto}
            </span>
          )}
          {desconto > 0 && (
            <div className="absolute top-3 left-3 bg-danger text-white text-center px-3 py-1.5 rounded-lg shadow-md">
              <span className="block text-xl font-extrabold leading-none">
                -{desconto}%
              </span>
              <span className="block text-[0.55rem] uppercase tracking-widest font-bold">
                OFF
              </span>
            </div>
          )}
          {oferta.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="absolute top-3 right-3 bg-accent-soft text-accent text-[0.65rem] font-extrabold px-2 py-0.5 rounded border border-accent/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Info */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="inline-block text-[0.65rem] font-bold text-primary uppercase tracking-wide mb-2">
              {oferta.marketplace}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-text leading-snug mb-3">
              {oferta.titulo}
            </h2>
            <p className="text-sm text-text-soft mb-4 line-clamp-3">
              {oferta.resumo}
            </p>

            {/* Preços */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4 pb-4 border-b border-border">
              <span className="text-2xl md:text-3xl font-extrabold text-primary">
                R$ {oferta.preco.toLocaleString("pt-BR")}
              </span>
              {oferta.precoOriginal && (
                <span className="text-sm text-text-muted line-through">
                  R$ {oferta.precoOriginal.toLocaleString("pt-BR")}
                </span>
              )}
              {desconto > 0 && (
                <span className="bg-danger text-white text-xs font-extrabold px-2.5 py-1 rounded-md">
                  -{desconto}%
                </span>
              )}
            </div>
            <p className="text-[0.7rem] text-text-muted mb-4">
              em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
            </p>

            {oferta.cupom && (
              <div className="bg-accent-soft border border-accent/40 rounded-md px-3 py-2 mb-4 text-sm font-bold text-text inline-block">
                🎟️ Cupom:{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded text-primary">
                  {oferta.cupom}
                </code>
              </div>
            )}
          </div>

          <a
            href={oferta.linkAfiliado}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="block w-full text-center bg-success hover:bg-success-dark text-white font-extrabold text-base py-3.5 rounded-xl transition shadow-soft hover:shadow-elevated no-underline"
          >
            Ir à Loja — R$ {oferta.preco.toLocaleString("pt-BR")}
          </a>
          <p className="text-[0.65rem] text-text-muted text-center mt-2">
            Link de afiliado — você não paga mais por isso
          </p>
        </div>
      </div>
    </div>
  );
}
