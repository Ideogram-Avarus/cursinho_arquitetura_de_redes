// Uma questão em detalhe, para projetar na revisão: as escolhas da turma e as respostas abertas SEM nome.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type { DetalheQuestao } from "../../shared/esquemas";
import {
  AVALIACOES,
  QUESTOES,
  QUESTOES_POR_ID,
  ROTULO_AVALIACAO,
  rotuloDaChave,
  type NivelAvaliacao,
  type Questao,
} from "../../shared/questoes";
import { Icone } from "../componentes/Icone";
import { BarraDeMarcacoes, LayoutDoPainel, LegendaDeMarcacoes, Porcentagem } from "../componentes/painel";
import { Texto } from "../componentes/Texto";
import { Aviso, Botao, Carregando, Cartao } from "../componentes/ui";
import { api, mensagemDeErro } from "../lib/api";

export function ProfessorQuestao() {
  const { id = "" } = useParams();
  const q = QUESTOES_POR_ID.get(id.toUpperCase());
  const [nomes, setNomes] = useState(false);

  const detalhe = useQuery({
    queryKey: ["questao", q?.id, nomes],
    queryFn: () => api<DetalheQuestao>("GET", `/professor/questoes/${q!.id}?nomes=${nomes}`),
    enabled: !!q,
    refetchInterval: 5000,
  });

  if (!q) {
    return (
      <LayoutDoPainel titulo="Questão" voltar="/professor">
        <Aviso tipo="erro">A questão {id} não existe.</Aviso>
      </LayoutDoPainel>
    );
  }

  const i = QUESTOES.indexOf(q);
  const anterior = QUESTOES[i - 1];
  const proxima = QUESTOES[i + 1];

  return (
    <LayoutDoPainel titulo={`Questão ${q.id}`} voltar="/professor">
      <Cartao className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {anterior && (
              <Link
                to={`/professor/q/${anterior.id}`}
                className="camada-estado rounded-full px-3 py-2 text-sm text-primary"
              >
                ← {anterior.id}
              </Link>
            )}
            {proxima && (
              <Link
                to={`/professor/q/${proxima.id}`}
                className="camada-estado rounded-full px-3 py-2 text-sm text-primary"
              >
                {proxima.id} →
              </Link>
            )}
          </div>
          <Botao
            variante={nomes ? "filled" : "outlined"}
            icone="olho"
            aria-pressed={nomes}
            onClick={() => setNomes(!nomes)}
          >
            {nomes ? "Esconder nomes" : "Mostrar nomes"}
          </Botao>
        </div>
        <h2 className="text-xl leading-relaxed md:text-2xl">
          <Texto>{q.enunciado}</Texto>
        </h2>
        {q.bloco && (
          <pre className="overflow-x-auto rounded-lg bg-surface-container-highest p-3 font-mono text-sm">{q.bloco}</pre>
        )}
      </Cartao>

      {detalhe.error && <Aviso tipo="erro">{mensagemDeErro(detalhe.error)}</Aviso>}
      {!detalhe.data ? (
        <Carregando />
      ) : (
        <>
          {q.marcavel && (
            <Cartao className="flex flex-col gap-2">
              <h3 className="font-medium">Como responderam</h3>
              <BarraDeMarcacoes marcacoes={detalhe.data.marcacoes} className="h-5" />
              <LegendaDeMarcacoes />
            </Cartao>
          )}
          {detalhe.data.fechadas.length > 0 && <Fechadas q={q} detalhe={detalhe.data} />}
          <Abertas q={q} detalhe={detalhe.data} />
        </>
      )}
    </LayoutDoPainel>
  );
}

function Fechadas({ q, detalhe }: { q: Questao; detalhe: DetalheQuestao }) {
  return (
    <Cartao className="flex flex-col gap-4">
      <h3 className="font-medium">Partes fechadas (o contorno marca a resposta certa)</h3>
      <div className="grid gap-5 md:grid-cols-2">
        {detalhe.fechadas.map((f) => {
          const total = Object.values(f.contagem).reduce((a, b) => a + b, 0);
          const ordenadas = Object.entries(f.contagem).sort((a, b) => b[1] - a[1]);
          return (
            <div key={f.chave} className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[15px]">
                  <Texto>{rotuloDaChave(q, f.chave)}</Texto>
                </span>
                <Porcentagem valor={f.acerto} />
              </div>
              {ordenadas.length === 0 && <span className="text-sm text-on-surface-variant">Ninguém respondeu.</span>}
              {ordenadas.map(([valor, n]) => {
                const certo = f.certas.includes(valor);
                return (
                  <div
                    key={valor}
                    className={clsx(
                      "relative flex items-center justify-between overflow-hidden rounded-md px-2 py-1 text-sm",
                      certo ? "ring-2 ring-primary" : "",
                    )}
                  >
                    <div
                      className={clsx(
                        "absolute inset-y-0 left-0",
                        certo ? "bg-primary-container" : "bg-surface-container-highest",
                      )}
                      style={{ width: `${(n / total) * 100}%` }}
                    />
                    <span className="relative flex items-center gap-1 font-medium">
                      {certo && <Icone nome="check" className="size-4 text-primary" />}
                      {valor}
                    </span>
                    <span className="relative tabular-nums">{n}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Cartao>
  );
}

function Abertas({ q, detalhe }: { q: Questao; detalhe: DetalheQuestao }) {
  // Chaves de texto livre: as que não são corrigidas sozinhas.
  const fechadas = new Set(detalhe.fechadas.map((f) => f.chave));
  const respostas = detalhe.respostas.filter(
    (r) => Object.keys(r.valor).some((k) => !fechadas.has(k)) || r.correcao || r.motivoErro,
  );
  const paraAvaliar = respostas.filter((r) => r.temParteAberta && !r.avaliacao).length;

  return (
    <Cartao className="flex flex-col gap-3">
      <h3 className="font-medium">
        Respostas escritas ({respostas.length}){" "}
        {!detalhe.respostas[0]?.nome && (
          <span className="text-sm font-normal text-on-surface-variant">— sem nomes</span>
        )}
        {paraAvaliar > 0 && (
          <span className="ml-2 rounded-md bg-tertiary-container px-1.5 py-0.5 text-xs text-on-tertiary-container">
            {paraAvaliar} para avaliar
          </span>
        )}
      </h3>
      {respostas.length === 0 && <p className="text-on-surface-variant">Nenhuma resposta escrita ainda.</p>}
      <ul className="grid gap-3 lg:grid-cols-2">
        {respostas.map((r, i) => {
          const abertas = Object.entries(r.valor).filter(([k]) => !fechadas.has(k));
          return (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-3 text-[15px] md:text-base"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">{r.nome ?? `Resposta ${i + 1}`}</span>
                <span className="flex items-center gap-2">
                  {r.marcacao && (
                    <span className="rounded bg-surface-container-highest px-1.5 py-0.5 font-bold">{r.marcacao}</span>
                  )}
                  {r.acerto !== null && <Porcentagem valor={r.acerto} />}
                </span>
              </div>
              {abertas.map(([chave, texto]) => (
                <div key={chave}>
                  {q.tipo !== "texto" && (
                    <p className="text-xs text-on-surface-variant">
                      <Texto>{rotuloDaChave(q, chave)}</Texto>
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{texto}</p>
                </div>
              ))}
              {(r.correcao || r.motivoErro || r.conferiu !== null) && (
                <div className="border-t border-dashed border-tertiary pt-2 text-sm whitespace-pre-wrap text-tertiary">
                  {r.conferiu === true && <p>✔ marcou que acertou.</p>}
                  {r.correcao && <p>Correção: {r.correcao}</p>}
                  {r.motivoErro && <p>Por que errou: {r.motivoErro}</p>}
                </div>
              )}
              {r.temParteAberta && <AvaliacaoDaResposta questaoId={q.id} resposta={r} />}
            </li>
          );
        })}
      </ul>
    </Cartao>
  );
}

const COR_AVALIACAO: Record<NivelAvaliacao, string> = {
  certa: "bg-primary-container text-on-primary-container border-transparent",
  parcial: "bg-tertiary-container text-on-tertiary-container border-transparent",
  errada: "bg-error-container text-on-error-container border-transparent",
};

/** Certa / parcial / errada da parte aberta. Quem avaliou (o Claude ou o professor) dá no mesmo: dá para trocar aqui. */
function AvaliacaoDaResposta({
  questaoId,
  resposta,
}: {
  questaoId: string;
  resposta: DetalheQuestao["respostas"][number];
}) {
  const cliente = useQueryClient();
  const salvar = useMutation({
    mutationFn: (avaliacao: NivelAvaliacao | null) =>
      api<{ salvas: number; ignoradas: { motivo: string }[] }>("PUT", "/professor/avaliacoes", {
        avaliacoes: [
          {
            usuarioId: resposta.usuarioId,
            questaoId,
            versao: resposta.versao,
            avaliacao,
            comentario: avaliacao === resposta.avaliacao ? resposta.comentarioAvaliacao : null,
          },
        ],
      }),
    onSettled: () => void cliente.invalidateQueries({ queryKey: ["questao", questaoId] }),
  });
  const ignorada = salvar.data?.ignoradas[0]?.motivo;

  return (
    <div className="flex flex-col gap-1.5 border-t border-outline-variant pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-on-surface-variant">Parte aberta:</span>
        {AVALIACOES.map((nivel) => (
          <button
            key={nivel}
            type="button"
            aria-pressed={resposta.avaliacao === nivel}
            disabled={salvar.isPending}
            onClick={() => salvar.mutate(resposta.avaliacao === nivel ? null : nivel)}
            className={clsx(
              "camada-estado min-h-9 rounded-lg border px-2.5 text-xs font-medium",
              resposta.avaliacao === nivel ? COR_AVALIACAO[nivel] : "border-outline-variant text-on-surface-variant",
            )}
          >
            {ROTULO_AVALIACAO[nivel]}
          </button>
        ))}
        {!resposta.avaliacao && <span className="text-xs text-tertiary">não avaliada</span>}
      </div>
      {resposta.comentarioAvaliacao && (
        <p className="text-sm text-on-surface-variant italic">{resposta.comentarioAvaliacao}</p>
      )}
      {(ignorada || salvar.error) && <p className="text-xs text-error">{ignorada ?? mensagemDeErro(salvar.error)}</p>}
    </div>
  );
}
