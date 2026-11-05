import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Aluno, Estado, Resumo, ResumoQuestao } from "../../shared/esquemas";
import { FASES, QUESTOES_POR_ID, ROTULO_FASE, type Fase } from "../../shared/questoes";
import { Icone } from "../componentes/Icone";
import { BarraDeMarcacoes, LayoutDoPainel, LegendaDeMarcacoes, Porcentagem, useEstado } from "../componentes/painel";
import { Texto } from "../componentes/Texto";
import { Aviso, BarraDeProgresso, Botao, Cartao, Segmentado } from "../componentes/ui";
import { api, mensagemDeErro } from "../lib/api";
import { tempoDesde, useAgora } from "../lib/tempo";

const AVISO_DA_FASE: Partial<Record<Fase, string>> = {
  correcao: "Liberar a correção? As respostas dos alunos ficam TRAVADAS.",
  ticket: "Liberar o ticket de saída? A correção fica travada.",
  encerrada: "Encerrar a aula? Ninguém consegue mais mudar nada. (Exporte os dados depois!)",
};

export function Professor() {
  const resumo = useQuery({
    queryKey: ["resumo"],
    queryFn: () => api<Resumo>("GET", "/professor/resumo"),
    refetchInterval: 5000,
  });
  const alunos = useQuery({
    queryKey: ["alunos"],
    queryFn: () => api<Aluno[]>("GET", "/professor/alunos"),
    refetchInterval: 5000,
  });

  return (
    <LayoutDoPainel titulo="Painel do professor">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <ControleDaAula alunos={resumo.data?.alunos ?? 0} />
        <Endereco />
      </div>
      {resumo.error && <Aviso tipo="erro">Sem conexão com o servidor: {mensagemDeErro(resumo.error)}</Aviso>}
      <Termometro resumo={resumo.data} />
      <ListaDeAlunos alunos={alunos.data} />
      <footer className="flex justify-end pt-4 pb-2">
        <Link to="/professor/dados" className="text-xs text-on-surface-variant/70 underline-offset-2 hover:underline">
          dados
        </Link>
      </footer>
    </LayoutDoPainel>
  );
}

function ControleDaAula({ alunos }: { alunos: number }) {
  const cliente = useQueryClient();
  const estado = useEstado();
  const mudarFase = useMutation({
    mutationFn: (fase: Fase) => api<Estado>("PUT", "/professor/estado", { fase }),
    onSuccess: (novo) => cliente.setQueryData(["estado"], novo),
  });

  return (
    <Cartao className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium">Fase da aula</h2>
        <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
          <Icone nome="pessoas" className="size-4" /> {alunos} {alunos === 1 ? "aluno" : "alunos"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Segmentado<Fase>
          rotulo="Fase da aula"
          obrigatorio
          opcoes={FASES}
          rotulos={ROTULO_FASE}
          valor={estado.data?.fase}
          disabled={mudarFase.isPending || !estado.data}
          aoMudar={(fase) => {
            if (!fase || fase === estado.data?.fase) return;
            const aviso = AVISO_DA_FASE[fase];
            if (!aviso || confirm(aviso)) mudarFase.mutate(fase);
          }}
        />
      </div>
      <p className="text-sm text-on-surface-variant">
        Atividade → Correção (respostas travam, aparece o “acertei / corrigir”) → Ticket de saída (sem consulta) →
        Encerrada. Dá para voltar a qualquer fase.
      </p>
      {mudarFase.error && <Aviso tipo="erro">{mensagemDeErro(mudarFase.error)}</Aviso>}
    </Cartao>
  );
}

function Endereco() {
  const url = window.location.origin;
  const [svg, setSvg] = useState("");
  const [projetando, setProjetando] = useState(false);

  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then(setSvg, () => setSvg(""));
  }, [url]);

  // O SVG vem da biblioteca de QR code (a partir da URL do próprio site), não de texto de aluno.
  const imagem = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : "";

  return (
    <Cartao className="flex items-center gap-4">
      {imagem && <img src={imagem} alt="QR code do site" className="size-24 shrink-0 rounded-lg bg-white p-1" />}
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-sm text-on-surface-variant">Endereço para os alunos</p>
        <p className="font-mono text-sm break-all">{url.replace(/^https?:\/\//, "")}</p>
        <Botao variante="tonal" icone="projetar" onClick={() => setProjetando(true)} className="self-start">
          Projetar
        </Botao>
      </div>
      {projetando && (
        <div
          role="dialog"
          aria-label="QR code para projetar"
          onClick={() => setProjetando(false)}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-6 bg-white p-6 text-black"
        >
          {imagem && <img src={imagem} alt="" className="aspect-square w-[min(70vh,90vw)]" />}
          <p className="text-center font-mono text-[clamp(1.5rem,5vw,4rem)] font-bold break-all">
            {url.replace(/^https?:\/\//, "")}
          </p>
          <p className="text-sm text-gray-500">Clique em qualquer lugar para fechar</p>
        </div>
      )}
    </Cartao>
  );
}

function Termometro({ resumo }: { resumo: Resumo | undefined }) {
  const [ordem, setOrdem] = useState<"dificuldade" | "numero">("dificuldade");
  if (!resumo) return null;

  const atividade = resumo.questoes.filter((q) => {
    const questao = QUESTOES_POR_ID.get(q.questaoId);
    return questao && questao.parte !== "T" && questao.parte !== "E";
  });
  const ordenadas =
    ordem === "dificuldade"
      ? [...atividade].sort((a, b) => b.dificuldade - a.dificuldade || b.respostas - a.respostas)
      : atividade;
  const ticket = resumo.questoes.filter((q) => q.questaoId.startsWith("T"));
  const parteE = resumo.questoes.filter((q) => q.questaoId.startsWith("E"));
  const paraAvaliar = resumo.questoes.reduce((s, q) => s + q.paraAvaliar, 0);
  const avaliadas = resumo.questoes.reduce((s, q) => s + q.avaliadas, 0);

  return (
    <Cartao className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-medium">Termômetro da turma</h2>
            <Link
              to="/professor/grafico"
              className="camada-estado inline-flex min-h-10 items-center gap-2 rounded-full bg-secondary-container px-4 text-sm font-medium text-on-secondary-container"
            >
              <Icone nome="projetar" className="size-[18px]" />
              Gráfico ao vivo
            </Link>
          </div>
          <p className="text-sm text-on-surface-variant">
            Ordenado da questão mais difícil para a mais fácil: mistura P + ? com o erro (partes fechadas e abertas já
            avaliadas).
          </p>
          {avaliadas + paraAvaliar > 0 && (
            <p className="mt-1 text-sm text-on-surface-variant">
              Partes abertas: <strong className="text-on-surface">{avaliadas}</strong> avaliadas,{" "}
              <strong className="text-on-surface">{paraAvaliar}</strong> para avaliar
              {paraAvaliar > 0 && " (rode /corrigir-aula03 no Claude Code, ou avalie clicando na questão)"}.
            </p>
          )}
        </div>
        <Segmentado
          rotulo="Ordenar"
          obrigatorio
          opcoes={["dificuldade", "numero"] as const}
          rotulos={{ dificuldade: "Mais difíceis", numero: "Por número" }}
          valor={ordem}
          aoMudar={(v) => v && setOrdem(v)}
        />
      </div>
      <LegendaDeMarcacoes />

      <div className="hidden grid-cols-[4rem_minmax(0,1fr)_5rem_4rem_6rem] gap-3 px-2 text-xs text-on-surface-variant md:grid">
        <span>Questão</span>
        <span>Como responderam</span>
        <span>Acerto</span>
        <span>Resp.</span>
        <span>Correção</span>
      </div>
      <ul className="-mt-2 flex flex-col">
        {ordenadas.map((q) => (
          <LinhaDoTermometro key={q.questaoId} q={q} />
        ))}
      </ul>

      <div className="grid gap-4 border-t border-outline-variant pt-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-medium">Ticket de saída (sem consulta)</h3>
          <ul className="flex flex-col">
            {ticket.map((q) => (
              <LinhaSimples key={q.questaoId} q={q} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-medium">Parte E (para o professor)</h3>
          <ul className="flex flex-col">
            {parteE.map((q) => (
              <LinhaSimples key={q.questaoId} q={q} />
            ))}
          </ul>
        </div>
      </div>
    </Cartao>
  );
}

function LinhaDoTermometro({ q }: { q: ResumoQuestao }) {
  const questao = QUESTOES_POR_ID.get(q.questaoId);
  const m = q.marcacoes;
  return (
    <li>
      <Link
        to={`/professor/q/${q.questaoId}`}
        className="camada-estado grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2.5 md:grid-cols-[4rem_minmax(0,1fr)_5rem_4rem_6rem]"
      >
        <span className="flex items-center gap-1 font-bold">
          {q.questaoId}
          {questao?.estrela && <Icone nome="estrela" className="size-3.5 text-tertiary" />}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <BarraDeMarcacoes marcacoes={m} />
          <span className="text-xs text-on-surface-variant tabular-nums">
            S {m.S} · C {m.C} · P {m.P} · ? {m["?"]}
          </span>
        </div>
        <span className="justify-self-end md:justify-self-start">
          <Porcentagem valor={q.acerto} />
        </span>
        <span className="col-start-2 text-xs text-on-surface-variant tabular-nums md:col-start-auto md:text-sm">
          {q.respostas} resp.
        </span>
        <span className="col-span-2 text-xs text-tertiary md:col-span-1">
          {q.conferiram + q.corrigiram > 0 && `✔ ${q.conferiram} · ✎ ${q.corrigiram}`}
          {q.paraAvaliar > 0 && (
            <span className="block text-on-surface-variant" title="Partes abertas ainda sem avaliação">
              {q.paraAvaliar} p/ avaliar
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

function LinhaSimples({ q }: { q: ResumoQuestao }) {
  const questao = QUESTOES_POR_ID.get(q.questaoId);
  return (
    <li>
      <Link
        to={`/professor/q/${q.questaoId}`}
        className="camada-estado flex items-center gap-3 rounded-lg px-2 py-2 text-sm"
      >
        <span className="w-8 font-bold">{q.questaoId}</span>
        <span className="min-w-0 flex-1 truncate text-on-surface-variant">
          {questao && <Texto>{questao.enunciado.replace(/\*\*/g, "")}</Texto>}
        </span>
        <span className="text-xs tabular-nums">{q.respostas} resp.</span>
        {q.acerto !== null && <Porcentagem valor={q.acerto} />}
      </Link>
    </li>
  );
}

function ListaDeAlunos({ alunos }: { alunos: Aluno[] | undefined }) {
  const agora = useAgora();
  if (!alunos) return null;
  return (
    <Cartao className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Alunos ({alunos.length})</h2>
      {alunos.length === 0 ? (
        <p className="text-on-surface-variant">Ninguém entrou ainda. Projete o QR code!</p>
      ) : (
        <ul className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
          {alunos.map((a) => (
            <li key={a.id} className="flex flex-col gap-1 border-b border-outline-variant py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{a.nome}</span>
                <span className="shrink-0 text-xs text-on-surface-variant">{a.usuario}</span>
              </div>
              <BarraDeProgresso valor={a.respondidas / a.total} />
              <div className="flex justify-between text-xs text-on-surface-variant tabular-nums">
                <span>
                  {a.respondidas}/{a.total} questões
                  {a.ticket > 0 && ` · ticket ${a.ticket}/5`}
                </span>
                <span className={clsx(a.ultimoSalvamento === null && "opacity-60")}>
                  {a.ultimoSalvamento ? `salvou ${tempoDesde(a.ultimoSalvamento, agora)}` : "nada salvo"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}
