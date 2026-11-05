// Avaliação das partes abertas. Aberto como o resto do painel.
// Uso típico: no intervalo, o Claude lê as pendentes (GET), avalia e grava em lote (PUT).
// Veja .claude/commands/corrigir-aula03.md na raiz do repositório.
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { esquemaParaAvaliar, esquemaResultadoAvaliacoes, esquemaSalvarAvaliacoes } from "../../shared/esquemas.js";
import { listarParaAvaliar, salvarAvaliacoes } from "../lib/avaliacoes.js";

const TAG = "Avaliações";

const avaliacoes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/professor/avaliacoes",
    {
      schema: {
        tags: [TAG],
        summary: "Lista as respostas abertas para avaliar",
        querystring: z.object({
          /** "A1,A10,C7": só essas questões. Sem isso, todas as que têm parte aberta. */
          questoes: z.string().max(200).optional(),
          /** true: inclui as já avaliadas (para revisar). Padrão: só as pendentes. */
          todas: z.enum(["true", "false"]).default("false"),
        }),
        response: { 200: esquemaParaAvaliar },
      },
    },
    async (request) =>
      listarParaAvaliar(app.prisma, {
        questoes: request.query.questoes
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        todas: request.query.todas === "true",
      }),
  );

  // PUT: gravar a mesma avaliação de novo dá no mesmo (idempotente). Aceita um lote de uma vez.
  app.put(
    "/professor/avaliacoes",
    {
      schema: {
        tags: [TAG],
        summary: "Grava um lote de avaliações",
        body: esquemaSalvarAvaliacoes,
        response: { 200: esquemaResultadoAvaliacoes },
      },
    },
    async (request) => {
      const resultado = await salvarAvaliacoes(app.prisma, request.body.avaliacoes);
      request.log.info(`🧑‍🏫 Avaliações gravadas: ${resultado.salvas} (ignoradas: ${resultado.ignoradas.length})`);
      return resultado;
    },
  );
};

export default avaliacoes;
