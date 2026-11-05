// Contas do painel do professor: termômetro, detalhe de uma questão e lista de alunos.
import type { Aluno, DetalheQuestao, Resumo, ResumoQuestao } from "../../shared/esquemas.js";
import { confere, GABARITO, normalizar } from "../../shared/gabarito.js";
import {
  MARCACOES,
  QUESTOES,
  QUESTOES_ATIVIDADE,
  QUESTOES_TICKET,
  respondida,
  type Marcacao,
  type NivelAvaliacao,
  type Questao,
} from "../../shared/questoes.js";
import { avaliacoesAtuais, buscarAvaliacao, notaDaResposta, temParteAberta } from "./avaliacoes.js";
import type { Prisma } from "./prisma.js";
import { lerValor } from "./respostas.js";

type Contagem = Record<Marcacao, number>;
const contagemVazia = (): Contagem => ({ S: 0, C: 0, P: 0, "?": 0 });

/** Todas as respostas, com o valor já lido e a avaliação da parte aberta (se ainda vale). */
async function todasAsRespostas(prisma: Prisma) {
  const [respostas, atuais] = await Promise.all([
    prisma.resposta.findMany({ include: { usuario: { select: { nome: true } } } }),
    avaliacoesAtuais(prisma),
  ]);
  return respostas.map((r) => ({
    ...r,
    valorObj: lerValor(r.valor),
    avaliacao: buscarAvaliacao(atuais, r.usuarioId, r.questaoId),
  }));
}

function resumirQuestao(q: Questao, respostas: Awaited<ReturnType<typeof todasAsRespostas>>): ResumoQuestao {
  const daQuestao = respostas.filter((r) => r.questaoId === q.id);
  const marcacoes = contagemVazia();
  for (const r of daQuestao) if (r.marcacao) marcacoes[r.marcacao as Marcacao]++;

  const comValor = daQuestao.filter((r) => respondida(r.valorObj));
  const acertos = comValor
    .map((r) => notaDaResposta(q, r.valorObj, r.avaliacao))
    .filter((a): a is number => a !== null);
  const comAberta = comValor.filter((r) => temParteAberta(q, r.valorObj));
  const avaliadas = comAberta.filter((r) => r.avaliacao).length;
  const acerto = acertos.length ? acertos.reduce((a, b) => a + b, 0) / acertos.length : null;

  // Dificuldade: a parte "insegura" das marcações (P e ?) e o erro (fechadas + abertas já avaliadas).
  const marcadas = MARCACOES.reduce((soma, m) => soma + marcacoes[m], 0);
  const inseguro = marcadas ? (marcacoes.P + marcacoes["?"]) / marcadas : 0;
  const dificuldade = acerto === null ? inseguro : (inseguro + (1 - acerto)) / 2;

  return {
    questaoId: q.id,
    respostas: comValor.length,
    marcacoes,
    acerto,
    corrigidas: acertos.length,
    conferiram: daQuestao.filter((r) => r.conferiu === true).length,
    corrigiram: daQuestao.filter((r) => !!r.correcao?.trim()).length,
    avaliadas,
    paraAvaliar: comAberta.length - avaliadas,
    dificuldade,
  };
}

export async function resumo(prisma: Prisma): Promise<Resumo> {
  const [alunos, respostas] = await Promise.all([prisma.usuario.count(), todasAsRespostas(prisma)]);
  return { alunos, questoes: QUESTOES.map((q) => resumirQuestao(q, respostas)) };
}

export async function detalheDaQuestao(prisma: Prisma, q: Questao, comNomes: boolean): Promise<DetalheQuestao> {
  const respostas = (await todasAsRespostas(prisma)).filter((r) => r.questaoId === q.id);
  const { marcacoes } = resumirQuestao(q, respostas);
  const comValor = respostas.filter((r) => respondida(r.valorObj));

  const fechadas = Object.entries(GABARITO[q.id] ?? {}).map(([chave, aceitas]) => {
    // Agrupa respostas iguais (sem diferenciar maiúsculas e acentos), mostrando a 1ª forma digitada.
    const grupos = new Map<string, { rotulo: string; n: number }>();
    let certas = 0;
    let responderam = 0;
    for (const r of comValor) {
      const bruto = r.valorObj[chave]?.trim();
      if (!bruto) continue;
      responderam++;
      if (confere(bruto, aceitas)) certas++;
      const chaveGrupo = normalizar(bruto);
      const grupo = grupos.get(chaveGrupo) ?? { rotulo: bruto, n: 0 };
      grupo.n++;
      grupos.set(chaveGrupo, grupo);
    }
    const contagem: Record<string, number> = {};
    for (const g of grupos.values()) contagem[g.rotulo] = g.n;
    return {
      chave,
      contagem,
      certas: [...grupos.values()].map((g) => g.rotulo).filter((rotulo) => confere(rotulo, aceitas)),
      // Só entre quem respondeu esta parte (null se ninguém respondeu).
      acerto: responderam ? certas / responderam : null,
    };
  });

  const lista = respostas
    .filter((r) => respondida(r.valorObj) || r.correcao?.trim() || r.motivoErro?.trim() || r.conferiu !== null)
    .sort((a, b) => a.atualizadoEm.getTime() - b.atualizadoEm.getTime())
    .map((r) => ({
      usuarioId: r.usuarioId,
      versao: r.atualizadoEm.toISOString(),
      nome: comNomes ? r.usuario.nome : null,
      valor: r.valorObj,
      marcacao: (r.marcacao as Marcacao | null) ?? null,
      correcao: r.correcao,
      motivoErro: r.motivoErro,
      conferiu: r.conferiu,
      acerto: notaDaResposta(q, r.valorObj, r.avaliacao),
      avaliacao: (r.avaliacao?.avaliacao as NivelAvaliacao | undefined) ?? null,
      comentarioAvaliacao: r.avaliacao?.comentario ?? null,
      temParteAberta: temParteAberta(q, r.valorObj),
    }));

  return {
    questaoId: q.id,
    marcacoes,
    fechadas,
    respostas: lista,
  };
}

export async function alunos(prisma: Prisma): Promise<Aluno[]> {
  const usuarios = await prisma.usuario.findMany({ include: { respostas: true }, orderBy: { nome: "asc" } });
  const idsAtividade = new Set(QUESTOES_ATIVIDADE.map((q) => q.id));
  const idsTicket = new Set(QUESTOES_TICKET.map((q) => q.id));
  return usuarios.map((u) => {
    const feitas = u.respostas.filter((r) => respondida(lerValor(r.valor)));
    const ultimo = u.respostas.reduce<Date | null>(
      (max, r) => (!max || r.atualizadoEm > max ? r.atualizadoEm : max),
      null,
    );
    return {
      id: u.id,
      usuario: u.usuario,
      nome: u.nome,
      respondidas: feitas.filter((r) => idsAtividade.has(r.questaoId)).length,
      total: idsAtividade.size,
      ticket: feitas.filter((r) => idsTicket.has(r.questaoId)).length,
      ultimoSalvamento: ultimo?.toISOString() ?? null,
    };
  });
}
