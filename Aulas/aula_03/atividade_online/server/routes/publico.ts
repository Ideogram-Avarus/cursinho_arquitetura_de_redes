import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { esquemaEstado } from "../../shared/esquemas.js";
import { QUESTOES } from "../../shared/questoes.js";
import { lerFase } from "../lib/dados.js";

const TAG = "Público";

const publico: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/status",
    {
      schema: {
        tags: [TAG],
        summary: "Confere se o servidor está no ar",
        response: { 200: z.object({ status: z.literal("ok") }) },
      },
    },
    async () => ({
      status: "ok" as const,
    }),
  );

  // As questões vão SEM gabarito (ele fica em shared/gabarito.ts, que só o servidor importa).
  app.get(
    "/questoes",
    { schema: { tags: [TAG], summary: "Lista as questões da atividade (sem gabarito)" } },
    async () => QUESTOES,
  );

  app.get(
    "/estado",
    { schema: { tags: [TAG], summary: "Mostra a fase atual da aula", response: { 200: esquemaEstado } } },
    async () => {
      const { fase, ultimoExport } = await lerFase(app.prisma);
      return { fase, ultimoExport: ultimoExport?.toISOString() ?? null };
    },
  );
};

export default publico;
