// O cartão de uma questão: enunciado, a resposta (componente do tipo), a marcação S C P ?
// e, na fase de correção, o resultado e a resposta certa (PainelDeCorrecao).
import type { ComponentType } from "react";
import type { CorrecaoDaQuestao } from "../../../shared/esquemas";
import { MARCACOES, ROTULO_MARCACAO, type Marcacao, type Questao, type Valor } from "../../../shared/questoes";
import { Icone } from "../Icone";
import { Texto } from "../Texto";
import { Cartao, Segmentado } from "../ui";
import { PainelDeCorrecao, type MudancaDeCorrecao } from "./PainelDeCorrecao";
import { RespostaClassificar, RespostaJustificar, RespostaTabela, RespostaVF } from "./RespostaClassificar";
import { RespostaOrdenar } from "./RespostaOrdenar";
import { RespostaCampos, RespostaTexto } from "./RespostaTexto";
import type { PropsResposta } from "./tipos";

const COMPONENTES: Record<Questao["tipo"], ComponentType<PropsResposta<never>>> = {
  texto: RespostaTexto,
  campos: RespostaCampos,
  classificar: RespostaClassificar,
  ordenar: RespostaOrdenar,
  tabela: RespostaTabela,
  justificar: RespostaJustificar,
  vf: RespostaVF,
};

export interface EstadoDaQuestao {
  valor: Valor;
  marcacao: Marcacao | null;
  correcao: string | null;
  motivoErro: string | null;
  conferiu: boolean | null;
}

export function CartaoQuestao({
  q,
  estado,
  modo,
  resultado,
  aoMudarValor,
  aoMudarMarcacao,
  aoMudarCorrecao,
  aoSair,
}: {
  q: Questao;
  estado: EstadoDaQuestao;
  /** "responder": tudo aberto • "corrigir": resposta travada + correção • "ler": tudo travado. */
  modo: "responder" | "corrigir" | "ler";
  /** Na fase de correção: o resultado desta questão (undefined enquanto carrega). */
  resultado?: CorrecaoDaQuestao;
  aoMudarValor: (v: Valor) => void;
  aoMudarMarcacao: (m: Marcacao | null) => void;
  aoMudarCorrecao: (c: MudancaDeCorrecao) => void;
  aoSair: () => void;
}) {
  const Resposta = COMPONENTES[q.tipo] as ComponentType<PropsResposta>;
  const travada = modo !== "responder";
  const corrigindo = modo === "corrigir" && q.corrigivel;

  return (
    <Cartao className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-container px-2 py-0.5 text-sm font-bold text-on-primary-container">
            {q.parte === "T" ? q.id.replace("T", "") : q.id}
          </span>
          {q.estrela && (
            <span className="flex items-center gap-1 text-xs font-medium text-tertiary">
              <Icone nome="estrela" className="size-4" /> prioritária
            </span>
          )}
        </div>
        <h3 className="text-base leading-relaxed sm:text-[17px]">
          <Texto>{q.enunciado}</Texto>
        </h3>
        {q.bloco && (
          <pre className="overflow-x-auto rounded-lg bg-surface-container-highest p-3 font-mono text-xs leading-relaxed sm:text-sm">
            {q.bloco}
          </pre>
        )}
      </header>

      <Resposta q={q} valor={estado.valor} aoMudar={aoMudarValor} aoSair={aoSair} travada={travada} />

      {q.marcavel && (
        <div className="flex flex-col gap-2 border-t border-outline-variant pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-on-surface-variant">
            Como você respondeu?
            {estado.marcacao && <strong className="ml-1 text-on-surface">{ROTULO_MARCACAO[estado.marcacao]}</strong>}
          </span>
          <Segmentado
            rotulo="Como você respondeu"
            opcoes={MARCACOES}
            valor={estado.marcacao}
            aoMudar={aoMudarMarcacao}
            dicas={ROTULO_MARCACAO}
            disabled={travada}
          />
        </div>
      )}

      {corrigindo &&
        (resultado ? (
          <PainelDeCorrecao
            q={q}
            valor={estado.valor}
            resultado={resultado}
            correcao={estado.correcao}
            motivoErro={estado.motivoErro}
            conferiu={estado.conferiu}
            aoMudar={aoMudarCorrecao}
            aoSair={aoSair}
          />
        ) : (
          <p className="text-sm text-on-surface-variant">Carregando a correção…</p>
        ))}

      {modo !== "responder" && !corrigindo && (estado.correcao || estado.conferiu !== null) && (
        <p className="text-sm text-tertiary">
          {estado.conferiu ? "✔ Você marcou que acertou." : null}
          {estado.correcao ? ` Correção: ${estado.correcao}` : null}
        </p>
      )}
    </Cartao>
  );
}
