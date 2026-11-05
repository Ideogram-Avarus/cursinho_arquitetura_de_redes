import clsx from "clsx";
import type { Item, QuestaoOrdenar, Valor } from "../../../shared/questoes";
import { Icone } from "../Icone";
import { Texto } from "../Texto";
import type { PropsResposta } from "./tipos";

/** A ordem atual: pela posição salva, ou a ordem da folha se o aluno ainda não mexeu. */
export function ordemAtual(itens: Item[], valor: Valor): Item[] {
  const temTodas = itens.every((i) => valor[i.id]);
  if (!temTodas) return itens;
  return [...itens].sort((a, b) => Number(valor[a.id]) - Number(valor[b.id]));
}

/** A7: setas ↑ ↓ (arrastar é ruim no celular). */
export function RespostaOrdenar({ q, valor, aoMudar, travada }: PropsResposta<QuestaoOrdenar>) {
  const ordem = ordemAtual(q.itens, valor);
  const mexeu = q.itens.every((i) => valor[i.id]);

  const mover = (de: number, para: number) => {
    const nova = [...ordem];
    const [item] = nova.splice(de, 1);
    nova.splice(para, 0, item!);
    aoMudar(Object.fromEntries(nova.map((it, i) => [it.id, String(i + 1)])));
  };

  return (
    <div className="flex flex-col gap-2">
      {!mexeu && !travada && (
        <p className="text-sm text-on-surface-variant">
          Use as setas para mudar a ordem. Se esta já for a ordem certa, toque em “Confirmar esta ordem”.
        </p>
      )}
      <ol className="flex flex-col gap-2">
        {ordem.map((item, i) => (
          <li
            key={item.id}
            className={clsx(
              "flex items-center gap-2 rounded-xl border py-1 pr-1 pl-3",
              mexeu ? "border-outline-variant bg-surface-container-lowest" : "border-dashed border-outline-variant",
            )}
          >
            <span
              className={clsx(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                mexeu ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant",
              )}
            >
              {mexeu ? i + 1 : "?"}
            </span>
            <span className="flex-1 py-2 text-[15px]">
              <Texto>{item.texto}</Texto>
            </span>
            <div className="flex shrink-0">
              <button
                type="button"
                aria-label={`Subir: ${item.texto}`}
                disabled={travada || i === 0}
                onClick={() => mover(i, i - 1)}
                className="camada-estado flex size-12 items-center justify-center rounded-full text-on-surface-variant disabled:opacity-30"
              >
                <Icone nome="cima" />
              </button>
              <button
                type="button"
                aria-label={`Descer: ${item.texto}`}
                disabled={travada || i === ordem.length - 1}
                onClick={() => mover(i, i + 1)}
                className="camada-estado flex size-12 items-center justify-center rounded-full text-on-surface-variant disabled:opacity-30"
              >
                <Icone nome="baixo" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      {!mexeu && !travada && (
        <button
          type="button"
          onClick={() => aoMudar(Object.fromEntries(ordem.map((it, i) => [it.id, String(i + 1)])))}
          className="camada-estado self-start rounded-full px-3 py-2 text-sm font-medium text-primary"
        >
          Confirmar esta ordem
        </button>
      )}
    </div>
  );
}
