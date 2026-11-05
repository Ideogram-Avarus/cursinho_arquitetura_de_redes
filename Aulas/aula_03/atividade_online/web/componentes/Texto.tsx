// Mostra **negrito** e `código` dos enunciados. Monta elementos React (nada de innerHTML),
// então nenhum texto vira HTML de verdade.
import { Fragment } from "react";

export function Texto({ children }: { children: string }) {
  const partes = children.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**")) return <strong key={i}>{parte.slice(2, -2)}</strong>;
        if (parte.startsWith("`") && parte.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-surface-container-highest px-1 py-0.5 font-mono text-[0.9em] break-all">
              {parte.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={i}>{parte}</Fragment>;
      })}
    </>
  );
}
