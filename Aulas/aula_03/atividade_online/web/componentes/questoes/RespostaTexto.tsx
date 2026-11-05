import type { QuestaoCampos, QuestaoTexto } from "../../../shared/questoes";
import { Texto } from "../Texto";
import { CampoTexto } from "../ui";
import { comChave, type PropsResposta } from "./tipos";

export function RespostaTexto({ valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoTexto>) {
  return (
    <CampoTexto
      rotulo="Sua resposta"
      valor={valor.texto ?? ""}
      aoMudar={(t) => aoMudar(comChave(valor, "texto", t))}
      aoSair={aoSair}
      disabled={travada}
    />
  );
}

/** Vários campos (A11, C7, D2) ou lacunas curtas (A9, C5, D1). */
export function RespostaCampos({ q, valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoCampos>) {
  const soCurtos = q.campos.every((c) => c.curto);
  return (
    <div className={soCurtos ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-4"}>
      {q.campos.map((c) => (
        <CampoTexto
          key={c.id}
          rotulo={<Texto>{c.rotulo}</Texto>}
          curto={c.curto}
          valor={valor[c.id] ?? ""}
          aoMudar={(t) => aoMudar(comChave(valor, c.id, t))}
          aoSair={aoSair}
          disabled={travada}
        />
      ))}
    </div>
  );
}
