// Avaliação das partes ABERTAS (texto livre): certa / parcial / errada + comentário.
// Pensado para o Claude avaliar no intervalo, pela API, mas o professor também avalia no painel.
import type { ParaAvaliar, SalvarAvaliacoes } from "../../shared/esquemas.js";
import { corrigir, GABARITO, INSTRUCOES_AVALIACAO, REFERENCIAS } from "../../shared/gabarito.js";
import {
  chavesDaQuestao,
  NOTA_AVALIACAO,
  QUESTOES,
  QUESTOES_POR_ID,
  rotuloDaChave,
  type NivelAvaliacao,
  type Questao,
  type Valor,
} from "../../shared/questoes.js";
import type { Avaliacao } from "../generated/prisma/client.js";
import type { Prisma } from "./prisma.js";
import { lerValor } from "./respostas.js";

/** As chaves de texto livre (as que o gabarito não corrige sozinho). A Parte E não tem resposta certa. */
export function chavesAbertas(q: Questao): string[] {
  if (q.parte === "E") return [];
  const fechadas = GABARITO[q.id] ?? {};
  return chavesDaQuestao(q).filter((c) => !(c in fechadas));
}

export const temParteAberta = (q: Questao, valor: Valor) => chavesAbertas(q).some((c) => valor[c]?.trim());

const chaveDoMapa = (usuarioId: number, questaoId: string) => `${usuarioId}:${questaoId}`;

/**
 * Avaliações que ainda valem: a resposta de hoje é a mesma que foi avaliada.
 * Se o aluno mudou a resposta depois, a avaliação "caduca" e a resposta volta a ficar pendente.
 */
export async function avaliacoesAtuais(prisma: Prisma): Promise<Map<string, Avaliacao>> {
  const [avaliacoes, respostas] = await Promise.all([
    prisma.avaliacao.findMany(),
    prisma.resposta.findMany({ select: { usuarioId: true, questaoId: true, valor: true } }),
  ]);
  const valorAtual = new Map(respostas.map((r) => [chaveDoMapa(r.usuarioId, r.questaoId), r.valor]));
  const mapa = new Map<string, Avaliacao>();
  for (const a of avaliacoes) {
    const chave = chaveDoMapa(a.usuarioId, a.questaoId);
    if (valorAtual.get(chave) === a.valorAvaliado) mapa.set(chave, a);
  }
  return mapa;
}

export const buscarAvaliacao = (mapa: Map<string, Avaliacao>, usuarioId: number, questaoId: string) =>
  mapa.get(chaveDoMapa(usuarioId, questaoId)) ?? null;

/**
 * Acerto da resposta (0 a 1): a parte fechada (gabarito) e a parte aberta (avaliação).
 * Quando a questão tem as duas, cada uma vale metade. null = nada para medir ainda.
 */
export function notaDaResposta(q: Questao, valor: Valor, avaliacao: Avaliacao | null): number | null {
  const fechada = corrigir(q.id, valor);
  const notaFechada = fechada ? fechada.certas / fechada.total : null;
  const notaAberta =
    avaliacao && temParteAberta(q, valor) ? NOTA_AVALIACAO[avaliacao.avaliacao as NivelAvaliacao] : null;
  if (notaFechada !== null && notaAberta !== null) return (notaFechada + notaAberta) / 2;
  return notaFechada ?? notaAberta;
}

export async function listarParaAvaliar(
  prisma: Prisma,
  filtro: { questoes?: string[]; todas: boolean },
): Promise<ParaAvaliar> {
  const [respostas, atuais] = await Promise.all([
    prisma.resposta.findMany({ orderBy: { usuarioId: "asc" } }),
    avaliacoesAtuais(prisma),
  ]);
  const pedidas = filtro.questoes?.length ? new Set(filtro.questoes.map((id) => id.toUpperCase())) : null;

  const questoes = QUESTOES.filter((q) => chavesAbertas(q).length > 0 && (!pedidas || pedidas.has(q.id)))
    .map((q) => {
      const abertas = new Set(chavesAbertas(q));
      const lista = respostas
        .filter((r) => r.questaoId === q.id)
        .map((r) => ({ r, valor: lerValor(r.valor), av: buscarAvaliacao(atuais, r.usuarioId, q.id) }))
        .filter(({ valor, av }) => temParteAberta(q, valor) && (filtro.todas || !av))
        .map(({ r, valor, av }) => ({
          usuarioId: r.usuarioId,
          versao: r.atualizadoEm.toISOString(),
          campos: chavesDaQuestao(q)
            .filter((c) => valor[c]?.trim())
            .map((c) => ({ rotulo: rotuloDaChave(q, c), texto: valor[c]!, aberta: abertas.has(c) })),
          avaliacao: (av?.avaliacao as NivelAvaliacao | undefined) ?? null,
          comentario: av?.comentario ?? null,
        }));
      return {
        questaoId: q.id,
        enunciado: q.enunciado.replace(/\*\*|`/g, ""),
        bloco: q.bloco ?? null,
        referencia: REFERENCIAS[q.id] ?? "",
        respostas: lista,
      };
    })
    .filter((q) => q.respostas.length > 0);

  return {
    instrucoes: INSTRUCOES_AVALIACAO,
    total: questoes.reduce((s, q) => s + q.respostas.length, 0),
    questoes,
  };
}

export async function salvarAvaliacoes(prisma: Prisma, itens: SalvarAvaliacoes["avaliacoes"]) {
  let salvas = 0;
  const ignoradas: { usuarioId: number; questaoId: string; motivo: string }[] = [];
  const ignorar = (i: (typeof itens)[number], motivo: string) =>
    ignoradas.push({ usuarioId: i.usuarioId, questaoId: i.questaoId, motivo });

  for (const item of itens) {
    const q = QUESTOES_POR_ID.get(item.questaoId.toUpperCase());
    if (!q || chavesAbertas(q).length === 0) {
      ignorar(item, "Essa questão não tem parte aberta para avaliar.");
      continue;
    }
    const resposta = await prisma.resposta.findUnique({
      where: { usuarioId_questaoId: { usuarioId: item.usuarioId, questaoId: q.id } },
    });
    if (!resposta) {
      ignorar(item, "Essa resposta não existe.");
      continue;
    }
    if (resposta.atualizadoEm.toISOString() !== item.versao) {
      ignorar(item, "O aluno mudou a resposta depois da leitura: leia de novo e avalie a versão nova.");
      continue;
    }
    const onde = { usuarioId_questaoId: { usuarioId: item.usuarioId, questaoId: q.id } };
    if (item.avaliacao === null) {
      await prisma.avaliacao.deleteMany({ where: { usuarioId: item.usuarioId, questaoId: q.id } });
    } else {
      const dados = {
        avaliacao: item.avaliacao,
        comentario: item.comentario?.trim() || null,
        valorAvaliado: resposta.valor,
        avaliadoEm: new Date(),
      };
      await prisma.avaliacao.upsert({
        where: onde,
        create: { usuarioId: item.usuarioId, questaoId: q.id, ...dados },
        update: dados,
      });
    }
    salvas++;
  }
  return { salvas, ignoradas };
}
