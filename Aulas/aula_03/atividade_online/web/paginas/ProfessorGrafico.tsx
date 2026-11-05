// Gráfico de acertos e erros para deixar no datashow enquanto a turma responde. Não mostra nomes nem respostas.
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Resumo, ResumoQuestao } from "../../shared/esquemas";
import { PARTES, QUESTOES_POR_ID, ROTULO_FASE } from "../../shared/questoes";
import { Icone } from "../componentes/Icone";
import { useEstado } from "../componentes/painel";
import { Botao, Carregando, Segmentado } from "../componentes/ui";
import { api } from "../lib/api";
import { barraDaQuestao, questoesDoConjunto, totais, type Conjunto } from "../lib/grafico";
import { useAgora } from "../lib/tempo";

const ATUALIZAR_A_CADA_MS = 3000;
/** Sem dados novos há mais tempo que isso, o telão avisa: um gráfico parado parece um gráfico certo. */
const DADOS_VELHOS_MS = 15_000;

const porcento = (valor: number | null) => (valor === null ? "—" : `${Math.round(valor * 100)}%`);
const inteiro = (valor: number) => Math.round(valor).toLocaleString("pt-BR");

/** Não deixa a tela do notebook apagar durante a aula (o navegador solta a trava quando a aba some). */
function useTelaAcesa() {
  useEffect(() => {
    let trava: WakeLockSentinel | null = null;
    const pedir = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        ?.request("screen")
        .then((t) => (trava = t))
        .catch(() => {
          // sem suporte ou sem HTTPS: a tela segue a configuração do sistema
        });
    };
    pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => {
      document.removeEventListener("visibilitychange", pedir);
      void trava?.release();
    };
  }, []);
}

export function ProfessorGrafico() {
  useTelaAcesa();
  const agora = useAgora(1000);
  const { data: estado } = useEstado();
  const [escolhido, setEscolhido] = useState<Conjunto | null>(null);
  const resumo = useQuery({
    queryKey: ["resumo"],
    queryFn: () => api<Resumo>("GET", "/professor/resumo"),
    refetchInterval: ATUALIZAR_A_CADA_MS,
    // Sem isto, o gráfico congela quando o professor troca de aba ou de janela.
    refetchIntervalInBackground: true,
  });

  // Acompanha a fase da aula, a não ser que o professor escolha o conjunto na mão.
  const conjunto = escolhido ?? (estado?.fase === "ticket" ? "ticket" : "atividade");
  const questoes = questoesDoConjunto(resumo.data?.questoes ?? [], conjunto);
  const alunos = resumo.data?.alunos ?? 0;
  const soma = totais(questoes);
  const paraAvaliar = questoes.reduce((s, q) => s + q.paraAvaliar, 0);
  const segundosParado = Math.round((agora - resumo.dataUpdatedAt) / 1000);
  const parado = !!resumo.data && agora - resumo.dataUpdatedAt > DADOS_VELHOS_MS;

  return (
    <div className="flex h-dvh min-h-[32rem] flex-col gap-[1.5vh] overflow-hidden p-[clamp(0.75rem,1.5vw,2rem)]">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to="/professor"
          aria-label="Voltar ao painel"
          className="camada-estado flex size-11 items-center justify-center rounded-full text-on-surface-variant"
        >
          <Icone nome="voltar" />
        </Link>
        <h1 className="text-[clamp(1.25rem,2.2vw,2.75rem)] font-semibold">Acertos e erros da turma</h1>
        <span className="text-[clamp(0.875rem,1.2vw,1.5rem)] text-on-surface-variant">
          {estado && `Fase: ${ROTULO_FASE[estado.fase]}`}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {parado ? (
            <span
              role="status"
              className="flex items-center gap-2 rounded-lg bg-error-container px-3 py-2 text-[clamp(0.875rem,1.2vw,1.5rem)] font-medium text-on-error-container"
            >
              <Icone nome="semNuvem" className="size-5" />
              Sem conexão há {segundosParado} s
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[clamp(0.875rem,1.2vw,1.5rem)] text-on-surface-variant">
              <span className="size-2.5 rounded-full bg-acerto motion-safe:animate-pulse" />
              Ao vivo
            </span>
          )}
          <div className="[&_button]:flex-auto">
            <Segmentado<Conjunto>
              rotulo="Questões do gráfico"
              obrigatorio
              opcoes={["atividade", "ticket"]}
              rotulos={{ atividade: "Atividade", ticket: "Ticket" }}
              valor={conjunto}
              aoMudar={setEscolhido}
            />
          </div>
          <Botao
            variante="outlined"
            icone="projetar"
            onClick={() => void document.documentElement.requestFullscreen?.()}
          >
            Tela cheia
          </Botao>
        </div>
      </header>

      <section aria-label="Totais da turma" className="flex flex-wrap items-end gap-x-[4vw] gap-y-2">
        <Numero rotulo="Acerto" valor={porcento(soma.acerto)} cor="bg-acerto" />
        <Numero rotulo="Erro" valor={soma.acerto === null ? "—" : porcento(1 - soma.acerto)} cor="bg-erro" />
        <Numero
          rotulo="Respostas"
          valor={inteiro(soma.respostas)}
          detalhe={`de ${inteiro(alunos * questoes.length)}`}
        />
        <Numero rotulo="Alunos" valor={inteiro(alunos)} />
        <Legenda />
      </section>

      {resumo.data ? <Grafico questoes={questoes} alunos={alunos} /> : <Carregando />}

      <p className="text-[clamp(0.75rem,1vw,1.25rem)] text-on-surface-variant">
        A altura total da barra é a turma inteira. Em questões com várias partes, cada resposta conta pela fração que
        acertou.
        {paraAvaliar > 0 && ` Partes abertas para avaliar: ${inteiro(paraAvaliar)}.`}
      </p>
    </div>
  );
}

function Numero({ rotulo, valor, detalhe, cor }: { rotulo: string; valor: string; detalhe?: string; cor?: string }) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-2 text-[clamp(0.875rem,1.2vw,1.5rem)] text-on-surface-variant">
        {cor && <span className={clsx("size-[0.8em] rounded-sm", cor)} />}
        {rotulo}
      </span>
      <span className="text-[clamp(2rem,4.2vw,5.5rem)] leading-none font-semibold tabular-nums">
        {valor}
        {detalhe && (
          <span className="ml-2 text-[clamp(0.875rem,1.4vw,1.75rem)] font-normal text-on-surface-variant">
            {detalhe}
          </span>
        )}
      </span>
    </div>
  );
}

function Legenda() {
  const itens = [
    { rotulo: "Acerto", classe: "bg-acerto" },
    { rotulo: "Erro", classe: "bg-erro" },
    { rotulo: "Aguardando correção", classe: "listras-aguardando" },
    { rotulo: "Sem resposta", classe: "bg-surface-container-highest" },
  ];
  return (
    <ul className="ml-auto flex flex-wrap gap-x-5 gap-y-1 text-[clamp(0.875rem,1.2vw,1.5rem)]">
      {itens.map((item) => (
        <li key={item.rotulo} className="flex items-center gap-2">
          <span className={clsx("size-[1em] rounded-sm", item.classe)} />
          {item.rotulo}
        </li>
      ))}
    </ul>
  );
}

function Grafico({ questoes, alunos }: { questoes: ResumoQuestao[]; alunos: number }) {
  // As barras ficam sempre na ordem da folha: num gráfico ao vivo, questão que muda de lugar confunde.
  const grupos = PARTES.map((parte) => ({
    parte,
    questoes: questoes.filter((q) => QUESTOES_POR_ID.get(q.questaoId)?.parte === parte.id),
  })).filter((g) => g.questoes.length > 0);
  // A barra nunca passa do topo, mesmo que a contagem de alunos venha menor que a de respostas.
  const turma = Math.max(alunos, ...questoes.map((q) => q.respostas), 1);

  return (
    <div className="flex min-h-0 flex-1 gap-[1.2vw] overflow-x-auto">
      {grupos.map(({ parte, questoes: daParte }) => (
        <section
          key={parte.id}
          aria-label={`Parte ${parte.id}: ${parte.titulo}`}
          className="flex min-w-[12.5vw] flex-col gap-1"
          style={{ flex: `${daParte.length} 1 0` }}
        >
          <h2 className="truncate border-b-2 border-outline-variant pb-0.5 text-[clamp(0.8rem,1.15vw,1.5rem)] font-medium">
            {parte.id === "T" ? parte.titulo : `${parte.id} · ${parte.titulo}`}
          </h2>
          <div className="flex min-h-0 flex-1 gap-[0.35vw]">
            {daParte.map((q) => (
              <Coluna key={q.questaoId} q={q} turma={turma} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Coluna({ q, turma }: { q: ResumoQuestao; turma: number }) {
  const { acertos, erros, aguardando } = barraDaQuestao(q);
  const corrigidas = acertos + erros;
  const acerto = corrigidas ? acertos / corrigidas : null;
  const descricao =
    `Questão ${q.questaoId}: ${q.respostas} ${q.respostas === 1 ? "resposta" : "respostas"}` +
    (acerto === null ? "" : `, ${porcento(acerto)} de acerto`) +
    (aguardando ? `, ${aguardando} aguardando correção` : "");

  return (
    <Link
      to={`/professor/q/${q.questaoId}`}
      title={descricao}
      aria-label={descricao}
      className="group flex min-w-7 flex-1 flex-col items-stretch gap-1 rounded-md text-center"
    >
      <span className="text-[clamp(0.72rem,1.15vw,1.6rem)] leading-tight font-semibold tabular-nums">
        {porcento(acerto)}
      </span>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t bg-surface-container-highest group-hover:outline-2 group-hover:outline-primary">
        <div className="absolute inset-0 flex flex-col-reverse">
          <Segmento valor={acertos} turma={turma} classe="bg-acerto" />
          <Segmento valor={erros} turma={turma} classe="bg-erro" />
          <Segmento valor={aguardando} turma={turma} classe="listras-aguardando" />
        </div>
      </div>
      <span className="text-[clamp(0.72rem,1.05vw,1.5rem)] leading-tight font-medium">{q.questaoId}</span>
    </Link>
  );
}

function Segmento({ valor, turma, classe }: { valor: number; turma: number; classe: string }) {
  return (
    <div
      className={clsx(
        "transition-[height] duration-700 ease-out motion-reduce:transition-none",
        valor > 0 && "border-t-2 border-surface-container-highest",
        classe,
      )}
      style={{ height: `${(valor / turma) * 100}%` }}
    />
  );
}
