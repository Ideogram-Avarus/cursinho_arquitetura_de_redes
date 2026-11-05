// Painel do professor: ABERTO, sem login (decisão do professor; o app só vive durante a aula).
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  esquemaAluno,
  esquemaDetalheQuestao,
  esquemaEstado,
  esquemaFase,
  esquemaResumo,
} from "../../shared/esquemas.js";
import { QUESTOES_POR_ID } from "../../shared/questoes.js";
import { lerFase } from "../lib/dados.js";
import { naoEncontrado } from "../lib/erros.js";
import { alunos, detalheDaQuestao, resumo } from "../lib/painel.js";

const TAG = "Professor";

const professor: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/professor/estado",
    {
      schema: {
        tags: [TAG],
        summary: "Muda a fase da aula",
        body: z.object({ fase: esquemaFase }),
        response: { 200: esquemaEstado },
      },
    },
    async (request) => {
      await app.prisma.estado.upsert({
        where: { id: 1 },
        create: { id: 1, fase: request.body.fase },
        update: { fase: request.body.fase },
      });
      request.log.info(`📣 Fase da aula: ${request.body.fase}`);
      const { fase, ultimoExport } = await lerFase(app.prisma);
      return { fase, ultimoExport: ultimoExport?.toISOString() ?? null };
    },
  );

  app.get(
    "/professor/resumo",
    { schema: { tags: [TAG], summary: "Resumo da turma por questão", response: { 200: esquemaResumo } } },
    async () => resumo(app.prisma),
  );

  app.get(
    "/professor/questoes/:id",
    {
      schema: {
        tags: [TAG],
        summary: "Detalhe das respostas de uma questão",
        description: "Com `nomes=true`, mostra quem respondeu o quê.",
        params: z.object({ id: z.string().max(10) }),
        querystring: z.object({ nomes: z.enum(["true", "false"]).default("false") }),
        response: { 200: esquemaDetalheQuestao },
      },
    },
    async (request) => {
      const q = QUESTOES_POR_ID.get(request.params.id.toUpperCase());
      if (!q) throw naoEncontrado(`A questão ${request.params.id} não existe.`);
      return detalheDaQuestao(app.prisma, q, request.query.nomes === "true");
    },
  );

  app.get(
    "/professor/alunos",
    {
      schema: {
        tags: [TAG],
        summary: "Lista os alunos e o progresso de cada um",
        response: { 200: z.array(esquemaAluno) },
      },
    },
    async () => alunos(app.prisma),
  );
};

export default professor;
