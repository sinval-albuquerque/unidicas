import Image from "next/image";
import type { Oferta } from "@/types/oferta";
import { EXTERNAL_LINK_REL } from "@/lib/constants";

/** Idade máxima (em dias) antes de o preço ser considerado desatualizado. */
const STALE_PRICE_DAYS = 7;

/** "2026-07-14" → "14/07" (pt-BR compacto, sem ano). */
function formatVerificadoEm(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Calcula dias desde a verificação (pode ser negativo se a data for futura). */
function diasDesde(iso: string, ref: Date = new Date()): number {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return Infinity;
  const diff = ref.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Card de oferta curada manualmente (vinda de src/content/ofertas/*.mdx ou Supabase).
 *
 * Mostra:
 *  - Imagem do produto
 *  - Badge de desconto (ex.: -26%) e tags (Frete Grátis, Liquida 7.7, etc.)
 *  - Marketplace
 *  - Preço original riscado + preço atual grande
 *  - Cupom se houver
 *  - "Preço verificado em DD/MM" (ou aviso de preço possivelmente desatualizado)
 *  - CTA grande com link de afiliado rastreado
 */
export function OfertaCuratedCard({ oferta }: { oferta: Oferta }) {
  const desconto =
    oferta.precoOriginal && oferta.precoOriginal > oferta.preco
      ? Math.round(
          ((oferta.precoOriginal - oferta.preco) / oferta.precoOriginal) * 100,
        )
      : 0;
  const parcela =
    oferta.preco >= 12 ? Math.max(1, Math.floor(oferta.preco / 12)) : oferta.preco;

  const dias = oferta.verificadoEm ? diasDesde(oferta.verificadoEm) : null;
  const precoStale = dias === null || dias > STALE_PRICE_DAYS;

  return (
    <article className="bg-bg border border-border rounded-xl overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-w-0">
      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-44 bg-bg-gray flex items-center justify-center overflow-hidden">
        {oferta.imagem ? (
          <Image
            src={oferta.imagem}
            alt={oferta.titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2"
          />
        ) : (
          <span className="text-text-muted text-sm font-bold uppercase tracking-widest">
            {oferta.categoria}
          </span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 max-w-[65%] z-10">
          {desconto > 0 && (
            <span className="bg-danger text-white text-[0.7rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              -{desconto}%
            </span>
          )}
          {oferta.emDestaque && (
            <span className="bg-accent text-black text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
              Top
            </span>
          )}
          {oferta.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-success-soft text-success text-[0.65rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide border border-success/30 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="absolute bottom-2 right-2 bg-bg/90 backdrop-blur text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-text-soft max-w-[55%] truncate z-10">
          {oferta.marketplace}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-1 min-w-0">
        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wide truncate">
          {oferta.categoria}
        </span>
        <h3 className="text-sm font-bold my-1.5 leading-snug min-h-[2.6rem] sm:min-h-[3.2rem] text-balance break-words-anywhere">
          {oferta.titulo}
        </h3>
        <p className="text-xs text-text-muted mb-2 flex-1 line-clamp-2 break-words-anywhere">
          {oferta.resumo}
        </p>

        {oferta.precoOriginal && (
          <span className="text-xs text-text-muted line-through whitespace-nowrap">
            de R$ {oferta.precoOriginal.toLocaleString("pt-BR")}
          </span>
        )}
        <div className="flex items-baseline gap-2 mb-1 min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold text-text whitespace-nowrap">
            R$ {oferta.preco.toLocaleString("pt-BR")}
          </span>
        </div>
        <span className="text-[0.7rem] text-text-muted mb-2 break-words-anywhere">
          em até 12x de R$ {parcela.toLocaleString("pt-BR")} sem juros
        </span>

        {/* Selo de verificação do preço: discreto quando fresco, alerta quando
            pode ter mudado (>7 dias ou sem data). Incentiva o usuário a
            conferir o link antes de comprar. */}
        <p
          className={
            "text-[0.65rem] font-semibold mb-2 flex items-center gap-1 " +
            (precoStale ? "text-amber-700" : "text-text-muted")
          }
          title={
            oferta.verificadoEm
              ? `Preço checado em ${oferta.verificadoEm}`
              : "Sem data de verificação — preço pode ter mudado."
          }
        >
          <span aria-hidden>{precoStale ? "⚠️" : "🟢"}</span>
          {oferta.verificadoEm
            ? precoStale
              ? `Preço de ${formatVerificadoEm(oferta.verificadoEm)} — confira no link`
              : `Preço verificado em ${formatVerificadoEm(oferta.verificadoEm)}`
            : "Preço pode ter mudado — confira no link"}
        </p>

        {oferta.cupom && (
          <div className="bg-accent-soft border border-accent/40 rounded-md px-2.5 py-1.5 mb-3 text-[0.7rem] font-bold text-text truncate">
            <span aria-hidden>🎟️ </span>Cupom:{" "}
            <code className="font-mono">{oferta.cupom}</code>
          </div>
        )}

        <a
          href={oferta.linkAfiliado}
          rel={EXTERNAL_LINK_REL}
          target="_blank"
          className="mt-auto block text-center bg-success text-white py-2.5 rounded-lg font-bold text-sm hover:bg-success/90 transition whitespace-nowrap"
        >
          Pegar oferta →
        </a>
      </div>
    </article>
  );
}
