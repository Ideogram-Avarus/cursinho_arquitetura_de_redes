// Contas do gráfico ao vivo: separa as respostas de cada questão em acerto, erro e aguardando correção.
import type { ResumoQuestao } from "../../shared/esquemas";
import { QUESTOES_POR_ID } from "../../shared/questoes";

export type Conjunto = "atividade" | "ticket";

export interface Barra {
  /** Em "respostas": uma resposta 60% certa soma 0,6 em acertos e 0,4 em erros. */
  acertos: number;
  erros: number;
  /** Abertas que ainda não têm nota. */
  aguardando: number;
}

export function barraDaQuestao(q: ResumoQuestao): Barra {
  const acertos = (q.acerto ?? 0) * q.corrigidas;
  return { acertos, erros: q.corrigidas - acertos, aguardando: q.respostas - q.corrigidas };
}

/** A Parte E fica de fora: ela é para o professor e não tem resposta certa. */
export function questoesDoConjunto(questoes: ResumoQuestao[], conjunto: Conjunto) {
  return questoes.filter((q) => {
    const parte = QUESTOES_POR_ID.get(q.questaoId)?.parte;
    if (!parte || parte === "E") return false;
    return conjunto === "ticket" ? parte === "T" : parte !== "T";
  });
}

export function totais(questoes: ResumoQuestao[]) {
  const soma = questoes.map(barraDaQuestao).reduce(
    (t, b) => ({
      acertos: t.acertos + b.acertos,
      erros: t.erros + b.erros,
      aguardando: t.aguardando + b.aguardando,
    }),
    { acertos: 0, erros: 0, aguardando: 0 },
  );
  const corrigidas = soma.acertos + soma.erros;
  return {
    ...soma,
    respostas: questoes.reduce((s, q) => s + q.respostas, 0),
    /** null enquanto nenhuma resposta tem nota. */
    acerto: corrigidas ? soma.acertos / corrigidas : null,
  };
}
