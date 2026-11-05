import type { ReactNode } from "react";
import type { QuestaoClassificar, QuestaoJustificar, QuestaoTabela, QuestaoVF } from "../../../shared/questoes";
import { Texto } from "../Texto";
import { CampoTexto, GrupoDeChips } from "../ui";
import { comChave, type PropsResposta } from "./tipos";

/** Uma linha "item + escolha": no celular empilha, no computador fica lado a lado como numa tabela. */
function Linha({ rotulo, children }: { rotulo: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-outline-variant py-3 first:border-t-0 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-4">
      <div className="text-[15px]">{rotulo}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

/** A2, A4, A5, C4, C6: classificar cada item com uma opção. */
export function RespostaClassificar({ q, valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoClassificar>) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        {q.itens.map((item) => (
          <Linha
            key={item.id}
            rotulo={
              <>
                <span className="font-medium">{item.id})</span> <Texto>{item.texto}</Texto>
              </>
            }
          >
            <GrupoDeChips
              rotulo={`${q.pergunta}: ${item.texto}`}
              opcoes={q.opcoes}
              valor={valor[item.id]}
              aoMudar={(v) => aoMudar(comChave(valor, item.id, v))}
              disabled={travada}
            />
          </Linha>
        ))}
      </div>
      {q.depois && (
        <div className="flex flex-col gap-4">
          <p className="text-[15px]">
            <Texto>{q.depois.enunciado}</Texto>
          </p>
          {q.depois.campos.map((c) => (
            <CampoTexto
              key={c.id}
              rotulo={<Texto>{c.rotulo}</Texto>}
              valor={valor[c.id] ?? ""}
              aoMudar={(t) => aoMudar(comChave(valor, c.id, t))}
              aoSair={aoSair}
              disabled={travada}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** B2, B3, T3: escolha + justificativa. */
export function RespostaJustificar({ q, valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoJustificar>) {
  return (
    <div>
      {q.itens.map((item) => (
        <Linha
          key={item.id}
          rotulo={
            <>
              {q.itens.length > 1 && /^[a-z]$/.test(item.id) && <span className="font-medium">{item.id}) </span>}
              <Texto>{item.texto}</Texto>
            </>
          }
        >
          <GrupoDeChips
            rotulo={`${q.pergunta}: ${item.texto}`}
            opcoes={q.opcoes}
            valor={valor[item.id]}
            aoMudar={(v) => aoMudar(comChave(valor, item.id, v))}
            disabled={travada}
          />
          <CampoTexto
            rotulo={q.rotuloJustificativa}
            curto
            valor={valor[`${item.id}.porque`] ?? ""}
            aoMudar={(t) => aoMudar(comChave(valor, `${item.id}.porque`, t))}
            aoSair={aoSair}
            disabled={travada}
          />
        </Linha>
      ))}
    </div>
  );
}

/** B1: tabela UDP × TCP. */
export function RespostaTabela({ q, valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoTabela>) {
  return (
    <div>
      {q.linhas.map((linha) => (
        <Linha key={linha.id} rotulo={linha.texto}>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.colunas.map((coluna) => {
              const chave = `${linha.id}.${coluna.id}`;
              return linha.opcoes ? (
                <div key={coluna.id} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-semibold text-on-surface-variant">{coluna.texto}</span>
                  <GrupoDeChips
                    rotulo={`${coluna.texto}: ${linha.texto}`}
                    opcoes={linha.opcoes}
                    valor={valor[chave]}
                    aoMudar={(v) => aoMudar(comChave(valor, chave, v))}
                    disabled={travada}
                  />
                </div>
              ) : (
                <CampoTexto
                  key={coluna.id}
                  rotulo={coluna.texto}
                  curto
                  valor={valor[chave] ?? ""}
                  aoMudar={(t) => aoMudar(comChave(valor, chave, t))}
                  aoSair={aoSair}
                  disabled={travada}
                />
              );
            })}
          </div>
        </Linha>
      ))}
    </div>
  );
}

/** B4: V ou F; o campo "corrija" só aparece quando a resposta é F. */
export function RespostaVF({ q, valor, aoMudar, aoSair, travada }: PropsResposta<QuestaoVF>) {
  return (
    <div>
      {q.itens.map((item) => {
        const chaveCorrecao = `${item.id}.correcao`;
        return (
          <Linha
            key={item.id}
            rotulo={
              <>
                <span className="font-medium">{item.id})</span> <Texto>{item.texto}</Texto>
              </>
            }
          >
            <GrupoDeChips
              rotulo={`Verdadeiro ou falso: ${item.texto}`}
              opcoes={["V", "F"]}
              valor={valor[item.id]}
              aoMudar={(v) => {
                let novo = comChave(valor, item.id, v);
                if (v !== "F") novo = comChave(novo, chaveCorrecao, undefined);
                aoMudar(novo);
              }}
              disabled={travada}
            />
            {valor[item.id] === "F" && (
              <CampoTexto
                rotulo="Corrija a frase"
                valor={valor[chaveCorrecao] ?? ""}
                aoMudar={(t) => aoMudar(comChave(valor, chaveCorrecao, t))}
                aoSair={aoSair}
                disabled={travada}
              />
            )}
          </Linha>
        );
      })}
    </div>
  );
}
