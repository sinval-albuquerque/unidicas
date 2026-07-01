import type { ReactNode } from "react";

/** Caixa de dica/destaque dentro de uma matéria. */
export function ProTip({
  title = "Dica",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="not-prose my-6 bg-accent-soft border-l-4 border-accent rounded-r-lg p-4 flex gap-3">
      <span className="text-2xl shrink-0" aria-hidden>
        💡
      </span>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-accent mb-1">
          {title}
        </p>
        <div className="text-sm text-text-soft leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}

/** Caixa de alerta/atenção. */
export function Warning({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose my-6 bg-danger-soft border-l-4 border-danger rounded-r-lg p-4 flex gap-3">
      <span className="text-2xl shrink-0" aria-hidden>
        ⚠️
      </span>
      <div className="text-sm text-text-soft leading-relaxed">{children}</div>
    </aside>
  );
}

/** Citação de fonte externa. */
export function Cite({
  source,
  href,
  children,
}: {
  source: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <blockquote className="not-prose my-6 border-l-4 border-primary bg-primary-light rounded-r-lg p-4 italic text-text-soft text-sm">
      <div className="not-italic">"{children}"</div>
      <footer className="mt-2 text-xs text-text-muted not-italic">
        —{" "}
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold no-underline hover:underline">
            {source}
          </a>
        ) : (
          source
        )}
      </footer>
    </blockquote>
  );
}
