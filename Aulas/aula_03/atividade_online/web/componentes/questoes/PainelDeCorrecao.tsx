// A fase de correção dentro do cartão: o resultado, a resposta certa, a justificativa da IA
// e, só no que o aluno errou, os campos para corrigir e comentar.
import clsx from "clsx";
import type { CorrecaoDaQuestao } from "../../../shared/esquemas";
import { rotuloDaChave, type Questao, type Valor } from "../../../shared/questoes";
import { Icone } from "../Icone";
import { Texto } from "../Texto";
import { Botao, CampoTexto } from "../ui";

export interface MudancaDeCorrecao {
  correcao?: string | null;
  motivoErro?: string | null;
  conferiu?: boolean | null;
}

const SITUACOES: Record<CorrecaoDaQuestao["situacao"], { rotulo: string; classe: string }> = {
  certa: { rotulo: "Você acertou", classe: "bg-primary-container text-on-primary-container" },
  parcial: { rotulo: "Acertou em parte", classe: "bg-tertiary-container text-on-tertiary-container" },
  errada: { rotulo: "Precisa corrigir", classe: "bg-error-container text-on-error-container" },
  pendente: { rotulo: "Compare com a resposta", classe: "bg-surface-container-highest text-on-surface" },
};

export function PainelDeCorrecao({
  q,
  valor,
  resultado,
  correcao,
  motivoErro,
  conferiu,
  aoMudar,
  aoSair,
}: {
  q: Questao;
  valor: Valor;
  resultado: CorrecaoDaQuestao;
  correcao: string | null;
  motivoErro: string | null;
  conferiu: boolean | null;
  aoMudar: (c: MudancaDeCorrecao) => void;
  aoSair: () => void;
}) {
  const { situacao, partes, respostaEsperada, justificativa, abertaEmBranco } = resultado;
  const situacaoVisivel = SITUACOES[situacao];
  const pendente = situacao === "pendente";
  const podeCorrigir = situacao === "parcial" || situacao === "errada" || (pendente && conferiu === false);

  return (
    <section aria-label="Correção" className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-3">
      <span className={clsx("self-start rounded-lg px-2.5 py-1 text-sm font-medium", situacaoVisivel.classe)}>
        {situacaoVisivel.rotulo}
      </span>

      {partes.length > 0 && (
        <ul className="flex flex-col gap-2 text-[15px]">
          {partes.map((p) => (
            <li key={p.chave} className="flex items-start gap-2">
              <Icone
                nome={p.certa ? "check" : "fechar"}
                className={clsx("mt-0.5 size-5 shrink-0", p.certa ? "text-primary" : "text-error")}
              />
              <span className="min-w-0">
                <Texto>{rotuloDaChave(q, p.chave)}</Texto>
                <span className="block text-sm text-on-surface-variant">
                  {p.certa ? (
                    <>
                      Resposta: <strong className="text-on-surface">{p.esperada}</strong>
                    </>
                  ) : (
                    <>
                      Você: {valor[p.chave]?.trim() || "em branco"} • Certo:{" "}
                      <strong className="text-on-surface">{p.esperada}</strong>
                    </>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {abertaEmBranco && <p className="text-sm text-on-surface-variant">Faltou a parte escrita.</p>}

      {respostaEsperada && (
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-medium">Resposta esperada</h4>
          <p className="text-[15px] leading-relaxed">
            <Texto>{respostaEsperada}</Texto>
          </p>
        </div>
      )}

      {justificativa && (
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-medium">Justificativa da IA</h4>
          <p className="text-[15px] leading-relaxed">{justificativa}</p>
        </div>
      )}

      {pendente && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-on-surface-variant">Sua resposta ainda não foi avaliada. Como ela ficou?</p>
          <div className="flex flex-wrap gap-2">
            <Botao
              variante={conferiu === true ? "filled" : "outlined"}
              icone="check"
              aria-pressed={conferiu === true}
              onClick={() =>
                aoMudar(conferiu === true ? { conferiu: null } : { conferiu: true, correcao: null, motivoErro: null })
              }
            >
              Acertei
            </Botao>
            <Botao
              variante={conferiu === false ? "filled" : "outlined"}
              icone="fechar"
              aria-pressed={conferiu === false}
              onClick={() => aoMudar({ conferiu: conferiu === false ? null : false })}
            >
              Errei
            </Botao>
          </div>
        </div>
      )}

      {podeCorrigir && (
        <div className="flex flex-col gap-3 border-t border-outline-variant pt-3">
          <CampoTexto
            rotulo="Sua correção"
            valor={correcao ?? ""}
            aoMudar={(t) => aoMudar({ correcao: t })}
            aoSair={aoSair}
          />
          <CampoTexto
            rotulo="Por que você errou? (opcional)"
            valor={motivoErro ?? ""}
            aoMudar={(t) => aoMudar({ motivoErro: t })}
            aoSair={aoSair}
          />
        </div>
      )}
    </section>
  );
}
