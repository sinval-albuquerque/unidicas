import type { TabelaComparativa } from "@/types/review";

/** Tabela comparativa: atributos nas linhas, produtos nas colunas, vencedor destacado. */
export function ComparisonTable({ tabela }: { tabela: TabelaComparativa }) {
  const { reviews, linhas } = tabela;
  if (reviews.length === 0) {
    return <p className="text-text-muted text-center py-8">Nenhum produto nesta categoria ainda.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-bg-alt">
            <th className="text-left p-3 border-b border-border font-bold sticky left-0 bg-bg-alt z-10">
              Atributo
            </th>
            {reviews.map((r) => (
              <th key={r.slug} className="text-center p-3 border-b border-border font-bold min-w-[140px]">
                {r.produto}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.atributo.id} className="even:bg-bg-alt">
              <td className="p-3 font-semibold border-b border-border sticky left-0 even:bg-bg-alt z-10">
                <span className="mr-1" aria-hidden>{linha.atributo.icone}</span>
                {linha.atributo.label}
              </td>
              {linha.valores.map(({ review, valor, vencedor }) => (
                <td
                  key={review.slug}
                  className={`text-center p-3 border-b border-border ${vencedor ? "bg-success/10 font-bold text-success" : ""}`}
                >
                  {valor.toLocaleString("pt-BR")} {linha.atributo.unidade}
                  {vencedor && <span className="block text-[0.65rem] mt-0.5">🏆 Melhor</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}