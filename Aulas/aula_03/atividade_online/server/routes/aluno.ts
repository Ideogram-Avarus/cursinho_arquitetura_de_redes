import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  esquemaCorrecaoDaQuestao,
  esquemaEu,
  esquemaResposta,
  esquemaSalvarCorrecao,
  esquemaSalvarResposta,
} from "../../shared/esquemas.js";
import { QUESTOES_POR_ID, ROTULO_FASE, type Fase } from "../../shared/questoes.js";
import { correcaoDaQuestao, correcoesDoAluno } from "../lib/correcao.js";
import { lerFase } from "../lib/dados.js";
import { ErroHttp, naoEncontrado, requisicaoInvalida } from "../lib/erros.js";
import { paraJson, validarValor } from "../lib/respostas.js";

const parametros = z.object({ questaoId: z.string().max(10) });

const faseErrada = (fase: Fase, oQue: string) =>
  new ErroHttp(409, "Fase errada", `${oQue} Agora a aula está na fase "${ROTULO_FASE[fase]}".`, "Recarregue a página.");

const TAG = "Aluno";
/** Cadeado no Swagger: a rota exige "Authorization: Bearer <token>". */
const comToken = [{ bearerAuth: [] }];

const aluno: FastifyPluginAsyncZod = async (app) => {
  app.addHook("preHandler", app.autenticar);

  app.get(
    "/eu",
    {
      schema: {
        tags: [TAG],
        summary: "Dados do aluno logado e as respostas dele",
        security: comToken,
        response: { 200: esquemaEu },
      },
    },
    async (request) => {
      const usuario = await app.prisma.usuario.findUniqueOrThrow({
        where: { id: request.aluno.id },
        include: { respostas: true },
      });
      return {
        id: usuario.id,
        usuario: usuario.usuario,
        nome: usuario.nome,
        respostas: usuario.respostas.map(paraJson),
      };
    },
  );

  // O gabarito só sai do servidor nesta fase: antes disso, a turma ainda está respondendo.
  app.get(
    "/eu/correcao",
    {
      schema: {
        tags: [TAG],
        summary: "Resultado e resposta certa de cada questão do aluno",
        description: 'Só funciona na fase "correcao". O ticket de saída nunca entra.',
        security: comToken,
        response: { 200: z.array(esquemaCorrecaoDaQuestao) },
      },
    },
    async (request) => {
      const { fase } = await lerFase(app.prisma);
      if (fase !== "correcao") throw faseErrada(fase, "A correção não está liberada.");
      return correcoesDoAluno(app.prisma, request.aluno.id);
    },
  );

  // PUT: salvar a mesma resposta duas vezes dá no mesmo (idempotente).
  app.put(
    "/eu/respostas/:questaoId",
    {
      schema: {
        tags: [TAG],
        summary: "Salva (ou substitui) a resposta de uma questão",
        description: 'Só funciona na fase "atividade" (ou "ticket", para as questões do ticket de saída).',
        security: comToken,
        params: parametros,
        body: esquemaSalvarResposta,
        response: { 200: esquemaResposta },
      },
    },
    async (request) => {
      const q = QUESTOES_POR_ID.get(request.params.questaoId);
      if (!q) throw naoEncontrado(`A questão ${request.params.questaoId} não existe.`);

      const { fase } = await lerFase(app.prisma);
      if (q.parte === "T" && fase !== "ticket") throw faseErrada(fase, "O ticket de saída não está liberado.");
      if (q.parte !== "T" && fase !== "atividade") throw faseErrada(fase, "As respostas da atividade estão travadas.");

      const { valor, marcacao } = request.body;
      if (marcacao && !q.marcavel) throw requisicaoInvalida(`A questão ${q.id} não tem marcação S C P ?.`);

      const dados = {
        ...(valor !== undefined && { valor: JSON.stringify(validarValor(q, valor)) }),
        ...(marcacao !== undefined && { marcacao }),
      };
      const salva = await app.prisma.resposta.upsert({
        where: { usuarioId_questaoId: { usuarioId: request.aluno.id, questaoId: q.id } },
        create: { usuarioId: request.aluno.id, questaoId: q.id, valor: "{}", ...dados },
        update: dados,
      });
      return paraJson(salva);
    },
  );

  // PATCH: muda só uma PARTE da resposta (a correção), sem mexer no que foi respondido.
  app.patch(
    "/eu/respostas/:questaoId",
    {
      schema: {
        tags: [TAG],
        summary: "Salva só a correção de uma resposta",
        description: 'Só funciona na fase "correcao", e não aceita questão que o aluno acertou.',
        security: comToken,
        params: parametros,
        body: esquemaSalvarCorrecao,
        response: { 200: esquemaResposta },
      },
    },
    async (request) => {
      const q = QUESTOES_POR_ID.get(request.params.questaoId);
      if (!q) throw naoEncontrado(`A questão ${request.params.questaoId} não existe.`);
      if (!q.corrigivel) throw requisicaoInvalida(`A questão ${q.id} não tem correção.`);

      const { fase } = await lerFase(app.prisma);
      if (fase !== "correcao") throw faseErrada(fase, "A correção não está liberada.");

      const { situacao } = await correcaoDaQuestao(app.prisma, request.aluno.id, q);
      if (situacao === "certa") {
        throw new ErroHttp(409, "Questão certa", `Você acertou a questão ${q.id}: ela não precisa de correção.`);
      }

      const { correcao, motivoErro, conferiu } = request.body;
      // "Acertei / errei" só existe enquanto ninguém avaliou: depois disso, quem decide é a avaliação.
      if (conferiu !== undefined && situacao !== "pendente") {
        throw requisicaoInvalida(`A questão ${q.id} já foi corrigida: não dá para marcar acertei ou errei.`);
      }
      const dados = {
        ...(correcao !== undefined && { correcao: correcao?.trim() ? correcao : null }),
        ...(motivoErro !== undefined && { motivoErro: motivoErro?.trim() ? motivoErro : null }),
        ...(conferiu !== undefined && { conferiu }),
      };
      const salva = await app.prisma.resposta.upsert({
        where: { usuarioId_questaoId: { usuarioId: request.aluno.id, questaoId: q.id } },
        create: { usuarioId: request.aluno.id, questaoId: q.id, valor: "{}", ...dados },
        update: dados,
      });
      return paraJson(salva);
    },
  );
};

export default aluno;
