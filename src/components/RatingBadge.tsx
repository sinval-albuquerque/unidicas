/** Badge de nota com estrelas (arredondada para 0.5). */
export function RatingBadge({
  nota,
  max = 5,
  compact = false,
}: {
  nota: number;
  max?: number;
  /** Modo compacto para overlay em cima de imagem. */
  compact?: boolean;
}) {
  const estrelasCheias = Math.floor(nota);
  const meia = nota - estrelasCheias >= 0.5;
  const vazias = max - estrelasCheias - (meia ? 1 : 0);

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-bg/95 backdrop-blur-sm text-text px-2.5 py-1 rounded-full shadow-floating">
        <span className="text-amber-500 text-sm leading-none" aria-hidden>
          ★
        </span>
        <span className="font-extrabold text-xs">{nota.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(estrelasCheias)}
        {meia ? "⯨" : ""}
        {"☆".repeat(vazias)}
      </span>
      <span className="font-bold">{nota.toFixed(1)}</span>
      <span className="text-text-muted text-xs">/ {max}</span>
    </div>
  );
}
