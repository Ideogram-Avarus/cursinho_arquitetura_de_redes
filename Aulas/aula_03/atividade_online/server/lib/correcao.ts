// O que o aluno vê na fase de correção: o resultado de cada questão e a resposta certa.
import type { CorrecaoDaQuestao } from "../../shared/esquemas.js";
import { corrigir, RESPOSTAS_ESPERADAS, textoDaResposta } from "../../shared/gabarito.js";
import {
  NOTA_AVALIACAO,
  QUESTOES,
  respondida,
  type NivelAvaliacao,
  type Questao,
  type Valor,
} from "../../shared/questoes.js";
import type { Avaliacao } from "../generated/prisma/client.js";
import { chavesAbertas, temParteAberta } from "./avaliacoes.js";
import type { Prisma } from "./prisma.js";
import { lerValor } from "./respostas.js";

export function resultadoDaQuestao(q: Questao, valor: Valor, avaliacao: Avaliacao | null): CorrecaoDaQuestao {
  const fechada = corrigir(q.id, valor);
  const temAberta = chavesAbertas(q).length > 0;
  const abertaPreenchida = temParteAberta(q, valor);
  const abertaEmBranco = temAberta && !abertaPreenchida && respondida(valor);

  return {
    questaoId: q.id,
    situacao: situacao(),
    partes: Object.entries(fechada?.porChave ?? {}).map(([chave, certa]) => ({
      chave,
      certa,
      esperada: textoDaResposta(q.id, chave),
    })),
    respostaEsperada: temAberta ? (RESPOSTAS_ESPERADAS[q.id] ?? null) : null,
    justificativa: avaliacao?.comentario ?? null,
    abertaEmBranco,
  };

  function situacao(): CorrecaoDaQuestao["situacao"] {
    if (!respondida(valor)) return "errada";
    const notaFechada = fechada ? fechada.certas / fechada.total : null;
    if (abertaPreenchida && !avaliacao) return notaFechada !== null && notaFechada < 1 ? "parcial" : "pendente";

    const notaAberta = !temAberta ? null : avaliacao ? NOTA_AVALIACAO[avaliacao.avaliacao as NivelAvaliacao] : 0;
    const notas = [notaFechada, notaAberta].filter((n) => n !== null);
    const nota = notas.reduce((a, b) => a + b, 0) / notas.length;
    return nota === 1 ? "certa" : nota === 0 ? "errada" : "parcial";
  }
}

/** A avaliação só vale para a resposta que foi avaliada (veja avaliacoesAtuais). */
const queVale = (avaliacao: Avaliacao | undefined, valorJson: string | undefined) =>
  avaliacao && avaliacao.valorAvaliado === valorJson ? avaliacao : null;

export async function correcoesDoAluno(prisma: Prisma, usuarioId: number): Promise<CorrecaoDaQuestao[]> {
  const [respostas, avaliacoes] = await Promise.all([
    prisma.resposta.findMany({ where: { usuarioId } }),
    prisma.avaliacao.findMany({ where: { usuarioId } }),
  ]);
  const valores = new Map(respostas.map((r) => [r.questaoId, r.valor]));
  const avaliadas = new Map(avaliacoes.map((a) => [a.questaoId, a]));
  // Só as Partes A a D: o ticket de saída vem depois da correção, e a resposta dele não pode vazar aqui.
  return QUESTOES.filter((q) => q.corrigivel).map((q) => {
    const json = valores.get(q.id);
    return resultadoDaQuestao(q, lerValor(json ?? "{}"), queVale(avaliadas.get(q.id), json));
  });
}

export async function correcaoDaQuestao(prisma: Prisma, usuarioId: number, q: Questao) {
  const chave = { usuarioId_questaoId: { usuarioId, questaoId: q.id } };
  const [resposta, avaliacao] = await Promise.all([
    prisma.resposta.findUnique({ where: chave }),
    prisma.avaliacao.findUnique({ where: chave }),
  ]);
  return resultadoDaQuestao(q, lerValor(resposta?.valor ?? "{}"), queVale(avaliacao ?? undefined, resposta?.valor));
}
