/** Badge de nota com estrelas (arredondada para 0.5). */
export function RatingBadge({ nota, max = 5 }: { nota: number; max?: number }) {
  const estrelasCheias = Math.floor(nota);
  const meia = nota - estrelasCheias >= 0.5;
  const vazias = max - estrelasCheias - (meia ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-accent" aria-hidden>
        {"★".repeat(estrelasCheias)}
        {meia ? "⯨" : ""}
        {"☆".repeat(vazias)}
      </span>
      <span className="font-bold">{nota.toFixed(1)}</span>
      <span className="text-text-muted text-xs">/ {max}</span>
    </div>
  );
}