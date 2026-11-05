import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import type { CorrecaoDaQuestao, Estado, Eu } from "../../shared/esquemas";
import {
  PARTES,
  QUESTOES_ATIVIDADE,
  QUESTOES_TICKET,
  respondida,
  ROTULO_FASE,
  ROTULO_MARCACAO,
  MARCACOES,
  type Marcacao,
  type Parte,
  type Questao,
  type Valor,
} from "../../shared/questoes";
import { Icone } from "../componentes/Icone";
import { CartaoQuestao, type EstadoDaQuestao } from "../componentes/questoes/CartaoQuestao";
import { Abas, Aviso, BarraDeProgresso, Botao, Carregando, Cartao } from "../componentes/ui";
import { api, ErroApi, gravarToken, lerToken } from "../lib/api";
import { FilaDeSalvamento, useFila, type Situacao } from "../lib/salvamento";

const VAZIO: EstadoDaQuestao = { valor: {}, marcacao: null, correcao: null, motivoErro: null, conferiu: null };
const PARTES_DA_ATIVIDADE = PARTES.filter((p) => p.id !== "T");

export function Atividade() {
  const navegar = useNavigate();
  const cliente = useQueryClient();
  const token = lerToken();

  const sair = useCallback(() => {
    gravarToken(null);
    cliente.clear();
    navegar("/", { replace: true });
  }, [cliente, navegar]);

  const eu = useQuery({
    queryKey: ["eu"],
    queryFn: () => api<Eu>("GET", "/eu"),
    enabled: !!token,
    staleTime: Infinity,
    retry: (n, erro) => !(erro instanceof ErroApi && erro.status === 401) && n < 3,
  });
  const estado = useQuery({
    queryKey: ["estado"],
    queryFn: () => api<Estado>("GET", "/estado"),
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (eu.error instanceof ErroApi && eu.error.status === 401) sair();
  }, [eu.error, sair]);

  if (!token) return <Navigate to="/" replace />;
  if (!eu.data || !estado.data) {
    if (eu.error && !(eu.error instanceof ErroApi && eu.error.status === 401)) {
      return (
        <main className="mx-auto max-w-md p-4 pt-16">
          <Aviso tipo="erro">Não consegui falar com o servidor. Confira a internet e recarregue a página.</Aviso>
        </main>
      );
    }
    return <Carregando />;
  }
  return <Folha eu={eu.data} fase={estado.data.fase} aoSair={sair} />;
}

function Folha({ eu, fase, aoSair }: { eu: Eu; fase: Estado["fase"]; aoSair: () => void }) {
  // A fila de salvamento é o rascunho: o que não foi enviado fica guardado no navegador.
  const fila = useMemo(
    () => new FilaDeSalvamento(`atividade-aula03:pendentes:${eu.usuario}`, () => {}, aoSair),
    [eu.usuario, aoSair],
  );
  const { situacao, aviso, pendentes } = useFila(fila);

  // Estado local das respostas: o que veio do servidor + o que ainda está na fila.
  const [respostas, setRespostas] = useState<Record<string, EstadoDaQuestao>>(() => {
    const inicial: Record<string, EstadoDaQuestao> = {};
    for (const r of eu.respostas) {
      inicial[r.questaoId] = {
        valor: r.valor,
        marcacao: r.marcacao,
        correcao: r.correcao,
        motivoErro: r.motivoErro,
        conferiu: r.conferiu,
      };
    }
    for (const [chave, p] of Object.entries(fila.foto().pendentes)) {
      const id = chave.split(" ")[1]!;
      inicial[id] = { ...(inicial[id] ?? VAZIO), ...p.corpo } as EstadoDaQuestao;
    }
    return inicial;
  });

  const mudar = (q: Questao, parcial: Partial<EstadoDaQuestao>) =>
    setRespostas((atual) => ({ ...atual, [q.id]: { ...(atual[q.id] ?? VAZIO), ...parcial } }));

  // Atualiza sozinho: as avaliações da IA podem chegar com a correção já aberta.
  const correcoes = useQuery({
    queryKey: ["correcao"],
    queryFn: () => api<CorrecaoDaQuestao[]>("GET", "/eu/correcao"),
    enabled: fase === "correcao",
    refetchInterval: 15_000,
  });
  const resultados = useMemo(() => new Map(correcoes.data?.map((c) => [c.questaoId, c])), [correcoes.data]);

  const [parte, setParte] = useState<Parte>("A");
  const topo = useRef<HTMLDivElement>(null);
  const irPara = (p: Parte) => {
    setParte(p);
    topo.current?.scrollIntoView({ behavior: "smooth" });
  };

  const modo = fase === "atividade" ? "responder" : fase === "correcao" ? "corrigir" : "ler";
  const lista = fase === "ticket" ? QUESTOES_TICKET : QUESTOES_ATIVIDADE.filter((q) => q.parte === parte);
  const feitas = (ps: Questao[]) => ps.filter((q) => respondida(respostas[q.id]?.valor)).length;

  return (
    <div className="min-h-dvh pb-24">
      <BarraDoTopo
        nome={eu.nome}
        fase={fase}
        situacao={situacao}
        pendentes={Object.keys(pendentes).length}
        aoSair={aoSair}
      />
      <div ref={topo} className="scroll-mt-16" />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4">
        {aviso && (
          <Aviso tipo="alerta" aoFechar={() => fila.limparAviso()}>
            {aviso}
          </Aviso>
        )}

        {fase === "encerrada" ? (
          <Cartao className="flex flex-col items-center gap-2 py-12 text-center">
            <Icone nome="check" className="size-12 text-primary" />
            <h2 className="text-2xl">Aula encerrada</h2>
            <p className="text-on-surface-variant">Obrigado! Suas respostas foram guardadas.</p>
          </Cartao>
        ) : fase === "ticket" ? (
          <>
            <Cartao destaque className="flex flex-col gap-1">
              <h2 className="text-xl">Ticket de saída</h2>
              <p className="text-on-surface-variant">
                <strong className="text-on-surface">Sem consulta</strong>: nada de caderno, colinha ou internet. São só
                5 perguntas rápidas. Responda o que você sabe agora.
              </p>
              <BarraDeProgresso valor={feitas(QUESTOES_TICKET) / QUESTOES_TICKET.length} className="mt-2" />
            </Cartao>
            {lista.map((q) => (
              <CartaoQuestao
                key={q.id}
                q={q}
                estado={respostas[q.id] ?? VAZIO}
                modo="responder"
                aoMudarValor={(valor) => {
                  mudar(q, { valor });
                  fila.salvarResposta(q.id, { valor });
                }}
                aoMudarMarcacao={() => {}}
                aoMudarCorrecao={() => {}}
                aoSair={() => fila.enviarAgora()}
              />
            ))}
          </>
        ) : (
          <>
            {fase === "correcao" && (
              <Aviso tipo="alerta">
                <strong>Hora da correção.</strong> Suas respostas estão travadas. Veja a resposta certa em cada questão.
                Onde você errou, escreva a correção e, se quiser, conte por que errou.
              </Aviso>
            )}
            <div className="sticky top-16 z-10 -mx-4 bg-surface px-4">
              <Abas<Parte>
                abas={PARTES_DA_ATIVIDADE.map((p) => {
                  const questoes = QUESTOES_ATIVIDADE.filter((q) => q.parte === p.id);
                  return {
                    id: p.id,
                    rotulo: (
                      <>
                        <span>
                          <span className="hidden sm:inline">Parte </span>
                          {p.id}
                        </span>
                        <span className="text-xs font-normal opacity-80">
                          {feitas(questoes)}/{questoes.length}
                        </span>
                      </>
                    ),
                  };
                })}
                ativa={parte}
                aoMudar={irPara}
              />
            </div>

            {parte === "A" && fase === "atividade" && <Instrucoes />}

            <div className="flex flex-col gap-1">
              <h2 className="text-xl">
                Parte {parte} — {PARTES.find((p) => p.id === parte)?.titulo}
              </h2>
              {parte === "E" && <p className="text-on-surface-variant">Não tem resposta certa.</p>}
              <BarraDeProgresso valor={feitas(lista) / lista.length} />
            </div>

            {lista.map((q) => (
              <CartaoQuestao
                key={q.id}
                q={q}
                estado={respostas[q.id] ?? VAZIO}
                modo={modo}
                resultado={resultados.get(q.id)}
                aoMudarValor={(valor: Valor) => {
                  mudar(q, { valor });
                  fila.salvarResposta(q.id, { valor });
                }}
                aoMudarMarcacao={(marcacao: Marcacao | null) => {
                  mudar(q, { marcacao });
                  fila.salvarResposta(q.id, { marcacao });
                }}
                aoMudarCorrecao={(c) => {
                  mudar(q, c);
                  fila.salvarCorrecao(q.id, c);
                }}
                aoSair={() => fila.enviarAgora()}
              />
            ))}

            <ProximaParte parte={parte} aoIr={irPara} />
          </>
        )}
      </main>
    </div>
  );
}

function BarraDoTopo({
  nome,
  fase,
  situacao,
  pendentes,
  aoSair,
}: {
  nome: string;
  fase: Estado["fase"];
  situacao: Situacao;
  pendentes: number;
  aoSair: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-surface-container px-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium">{nome}</p>
        <p className="text-xs text-on-surface-variant">Fase: {ROTULO_FASE[fase]}</p>
      </div>
      <IndicadorDeSalvamento situacao={situacao} pendentes={pendentes} />
      <button
        type="button"
        onClick={() => {
          if (pendentes === 0 || confirm("Ainda tem resposta para enviar. Sair mesmo assim?")) aoSair();
        }}
        className="camada-estado flex size-12 items-center justify-center rounded-full text-on-surface-variant"
        aria-label="Sair"
        title="Sair"
      >
        <Icone nome="sair" />
      </button>
    </header>
  );
}

function IndicadorDeSalvamento({ situacao, pendentes }: { situacao: Situacao; pendentes: number }) {
  const efetiva: Situacao = situacao === "salvo" && pendentes > 0 ? "salvando" : situacao;
  return (
    <span
      aria-live="polite"
      className={clsx(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
        efetiva === "salvo" && "text-on-surface-variant",
        efetiva === "salvando" && "bg-secondary-container text-on-secondary-container",
        efetiva === "sem-conexao" && "bg-error-container text-on-error-container",
      )}
    >
      <Icone nome={efetiva === "sem-conexao" ? "semNuvem" : "nuvem"} className="size-4" />
      {efetiva === "salvo" ? "salvo ✓" : efetiva === "salvando" ? "salvando…" : "sem conexão"}
    </span>
  );
}

function Instrucoes() {
  return (
    <Cartao destaque className="flex flex-col gap-3 text-[15px]">
      <h2 className="text-lg font-medium">Isto não é prova</h2>
      <p>
        Não vale nota. Serve para o professor saber <strong>o que ficou claro</strong> e o que precisa ser explicado de
        novo.
      </p>
      <ul className="ml-5 list-disc space-y-1">
        <li>
          Você <strong>pode</strong> usar o caderno, a colinha, a internet e conversar com o colega.
        </li>
        <li>
          Mas escreva <strong>com as suas palavras</strong> (copiar e colar da internet não ajuda ninguém).
        </li>
        <li>
          Comece pelas questões <strong>prioritárias</strong> (com estrela). Se sobrar tempo, faça as outras.
        </li>
        <li>Em cada questão, marque como você respondeu:</li>
      </ul>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {MARCACOES.map((m) => (
          <span key={m} className="rounded-lg bg-surface-container-lowest px-3 py-2">
            <strong>{m}</strong> {ROTULO_MARCACAO[m]}
          </span>
        ))}
      </div>
      <p className="text-sm text-on-surface-variant">
        Marcar <strong>?</strong> não é ruim: é a informação mais útil para o professor. Tudo é salvo sozinho.
      </p>
    </Cartao>
  );
}

function ProximaParte({ parte, aoIr }: { parte: Parte; aoIr: (p: Parte) => void }) {
  const ids = PARTES_DA_ATIVIDADE.map((p) => p.id);
  const i = ids.indexOf(parte);
  return (
    <div className="flex justify-between gap-2 pt-2">
      {i > 0 ? (
        <Botao variante="text" icone="voltar" onClick={() => aoIr(ids[i - 1]!)}>
          Parte {ids[i - 1]}
        </Botao>
      ) : (
        <span />
      )}
      {i < ids.length - 1 && (
        <Botao variante="tonal" onClick={() => aoIr(ids[i + 1]!)}>
          Próxima: Parte {ids[i + 1]}
        </Botao>
      )}
    </div>
  );
}
