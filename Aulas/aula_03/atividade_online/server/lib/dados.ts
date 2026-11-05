// Exportar e importar: é o que guarda os dados, já que o banco morre com a máquina do Fly.
import type { Export } from "../../shared/esquemas.js";
import { corrigir } from "../../shared/gabarito.js";
import {
  FASES,
  QUESTOES,
  QUESTOES_POR_ID,
  rotuloDaChave,
  type Fase,
  type NivelAvaliacao,
} from "../../shared/questoes.js";
import { avaliacoesAtuais, buscarAvaliacao, chavesAbertas } from "./avaliacoes.js";
import { gerarCsv } from "./csv.js";
import { requisicaoInvalida } from "./erros.js";
import type { Prisma } from "./prisma.js";
import { lerValor, validarValor } from "./respostas.js";

export async function lerFase(prisma: Prisma): Promise<{ fase: Fase; ultimoExport: Date | null }> {
  const estado = await prisma.estado.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
  const fase = (FASES as readonly string[]).includes(estado.fase) ? (estado.fase as Fase) : "atividade";
  return { fase, ultimoExport: estado.ultimoExport };
}

export async function exportarJson(prisma: Prisma): Promise<Export> {
  const [{ fase }, usuarios] = await Promise.all([
    lerFase(prisma),
    prisma.usuario.findMany({ include: { respostas: true, avaliacoes: true }, orderBy: { id: "asc" } }),
  ]);
  return {
    formato: "atividade-aula03",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    fase,
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usuario: u.usuario,
      senhaHash: u.senhaHash,
      nome: u.nome,
      criadoEm: u.criadoEm.toISOString(),
      respostas: u.respostas.map((r) => ({
        questaoId: r.questaoId,
        valor: lerValor(r.valor),
        marcacao: (r.marcacao as Export["usuarios"][number]["respostas"][number]["marcacao"]) ?? null,
        correcao: r.correcao,
        motivoErro: r.motivoErro,
        conferiu: r.conferiu,
        atualizadoEm: r.atualizadoEm.toISOString(),
      })),
      avaliacoes: u.avaliacoes.map((a) => ({
        questaoId: a.questaoId,
        avaliacao: a.avaliacao as NivelAvaliacao,
        comentario: a.comentario,
        valorAvaliado: lerValor(a.valorAvaliado),
        avaliadoEm: a.avaliadoEm.toISOString(),
      })),
    })),
  };
}

const ordemDaQuestao = new Map(QUESTOES.map((q, i) => [q.id, i]));

export async function exportarCsv(prisma: Prisma): Promise<string> {
  const [usuarios, atuais] = await Promise.all([
    prisma.usuario.findMany({ include: { respostas: true }, orderBy: { nome: "asc" } }),
    avaliacoesAtuais(prisma),
  ]);
  const linhas = usuarios.flatMap((u) =>
    [...u.respostas]
      .sort((a, b) => (ordemDaQuestao.get(a.questaoId) ?? 99) - (ordemDaQuestao.get(b.questaoId) ?? 99))
      .map((r) => {
        const q = QUESTOES_POR_ID.get(r.questaoId);
        const valor = lerValor(r.valor);
        const resposta =
          q?.tipo === "texto"
            ? (valor.texto ?? "")
            : Object.entries(valor)
                .map(([chave, texto]) => `${q ? rotuloDaChave(q, chave) : chave}: ${texto}`)
                .join(" | ");
        const c = corrigir(r.questaoId, valor);
        const av = buscarAvaliacao(atuais, u.id, r.questaoId);
        return [
          u.usuario,
          u.nome,
          r.questaoId,
          resposta,
          r.marcacao,
          c ? `${c.certas}/${c.total}` : "",
          r.correcao,
          r.motivoErro,
          r.conferiu === null ? "" : r.conferiu ? "sim" : "não",
          av?.avaliacao,
          av?.comentario,
          r.atualizadoEm.toISOString(),
        ];
      }),
  );
  return gerarCsv(
    [
      "usuário",
      "nome",
      "questão",
      "resposta",
      "marcação",
      "acertou",
      "correção",
      "por que errou",
      "conferiu",
      "avaliação",
      "comentário da avaliação",
      "atualizado_em",
    ],
    linhas,
  );
}

export async function marcarExport(prisma: Prisma) {
  await prisma.estado.upsert({
    where: { id: 1 },
    create: { id: 1, ultimoExport: new Date() },
    update: { ultimoExport: new Date() },
  });
}

/**
 * Substitui o banco inteiro pelo conteúdo do JSON. O formato já chegou validado pelo Zod;
 * aqui conferimos o que o Zod não sabe (questões que existem, ids repetidos...).
 * Se algo estiver errado, nada é apagado.
 */
export async function importarJson(prisma: Prisma, dados: Export) {
  const ids = new Set<number>();
  const nomesDeUsuario = new Set<string>();
  for (const u of dados.usuarios) {
    if (ids.has(u.id)) throw requisicaoInvalida(`O id ${u.id} aparece duas vezes no arquivo.`);
    if (nomesDeUsuario.has(u.usuario))
      throw requisicaoInvalida(`O usuário "${u.usuario}" aparece duas vezes no arquivo.`);
    ids.add(u.id);
    nomesDeUsuario.add(u.usuario);
    const questoes = new Set<string>();
    for (const r of u.respostas) {
      const q = QUESTOES_POR_ID.get(r.questaoId);
      if (!q) throw requisicaoInvalida(`A questão "${r.questaoId}" (usuário ${u.usuario}) não existe.`);
      if (questoes.has(r.questaoId)) {
        throw requisicaoInvalida(`O usuário ${u.usuario} tem duas respostas para a questão ${r.questaoId}.`);
      }
      questoes.add(r.questaoId);
      validarValor(q, r.valor);
    }
    const avaliadas = new Set<string>();
    for (const a of u.avaliacoes) {
      const q = QUESTOES_POR_ID.get(a.questaoId);
      if (!q || chavesAbertas(q).length === 0) {
        throw requisicaoInvalida(`A avaliação da questão "${a.questaoId}" (usuário ${u.usuario}) não vale.`);
      }
      if (avaliadas.has(a.questaoId)) {
        throw requisicaoInvalida(`O usuário ${u.usuario} tem duas avaliações para a questão ${a.questaoId}.`);
      }
      avaliadas.add(a.questaoId);
      validarValor(q, a.valorAvaliado);
    }
  }

  const respostas = dados.usuarios.flatMap((u) =>
    u.respostas.map((r) => ({
      usuarioId: u.id,
      questaoId: r.questaoId,
      valor: JSON.stringify(r.valor),
      marcacao: r.marcacao,
      correcao: r.correcao,
      motivoErro: r.motivoErro,
      conferiu: r.conferiu,
      atualizadoEm: new Date(r.atualizadoEm),
    })),
  );

  const avaliacoes = dados.usuarios.flatMap((u) =>
    u.avaliacoes.map((a) => ({
      usuarioId: u.id,
      questaoId: a.questaoId,
      avaliacao: a.avaliacao,
      comentario: a.comentario,
      valorAvaliado: JSON.stringify(a.valorAvaliado),
      avaliadoEm: new Date(a.avaliadoEm),
    })),
  );

  await prisma.$transaction([
    prisma.avaliacao.deleteMany(),
    prisma.resposta.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.usuario.createMany({
      data: dados.usuarios.map((u) => ({
        id: u.id,
        usuario: u.usuario,
        senhaHash: u.senhaHash,
        nome: u.nome,
        criadoEm: new Date(u.criadoEm),
      })),
    }),
    prisma.resposta.createMany({ data: respostas }),
    prisma.avaliacao.createMany({ data: avaliacoes }),
    prisma.estado.upsert({ where: { id: 1 }, create: { id: 1, fase: dados.fase }, update: { fase: dados.fase } }),
  ]);

  return { usuarios: dados.usuarios.length, respostas: respostas.length, fase: dados.fase };
}
