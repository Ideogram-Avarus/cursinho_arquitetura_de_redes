import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErroSchema } from "@/schemas/comum";

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/eco",
    {
      schema: {
        tags: ["4. Enviando dados (POST)"],
        summary: "Devolve o JSON que você enviou (não guarda nada)",
        description:
          "Bom para testar erros: JSON quebrado (400), corpo vazio (400) e Content-Type: text/plain (415).",
        body: z
          .record(z.string(), z.unknown())
          .describe("Qualquer objeto JSON")
          .meta({ examples: [{ nome: "Maria", idade: 16, curso: "Desenvolvimento de Sistemas" }] }),
        response: {
          200: z.object({
            mensagem: z.string(),
            metodo: z.string(),
            contentType: z.string().nullable(),
            tamanhoBytes: z.number().int().nullable(),
            recebido: z.record(z.string(), z.unknown()),
          }),
          400: ErroSchema,
          415: ErroSchema,
        },
      },
    },
    async (request) => ({
      mensagem: "Recebi isto no corpo da sua requisição:",
      metodo: request.method,
      contentType: request.headers["content-type"] ?? null,
      tamanhoBytes: request.headers["content-length"] ? Number(request.headers["content-length"]) : null,
      recebido: request.body,
    }),
  );
};

export default rotas;
