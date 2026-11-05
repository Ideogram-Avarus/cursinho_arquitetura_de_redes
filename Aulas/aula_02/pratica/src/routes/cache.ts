import { createHash } from "node:crypto";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const TAG = "9. Cache";

const CotacaoSchema = z.object({ ticker: z.string(), preco: z.number() });

const rotas: FastifyPluginAsyncZod = async (app) => {
  const cotacoesOficiais = () =>
    app.prisma.batata.findMany({
      where: { oficial: true },
      select: { ticker: true, preco: true },
      orderBy: { ticker: "asc" },
    });

  app.get(
    "/cache/publico",
    {
      schema: {
        tags: [TAG],
        summary: "Boletim que PODE ficar em cache por 60 segundos",
        description:
          "Cabeçalho Cache-Control: public, max-age=60. Abra pela barra de endereço várias vezes: o 'geradoEm' só muda depois de 60 s (veja '(disk cache)' na aba Rede).",
        response: { 200: z.object({ boletim: z.string(), geradoEm: z.string(), cotacoes: z.array(CotacaoSchema) }) },
      },
    },
    async (_request, reply) => {
      reply.header("Cache-Control", "public, max-age=60");
      return { boletim: "Boletim da Bolsa de Batatas", geradoEm: new Date().toISOString(), cotacoes: await cotacoesOficiais() };
    },
  );

  app.get(
    "/cache/sem-cache",
    {
      schema: {
        tags: [TAG],
        summary: "Resposta que NUNCA deve ficar em cache",
        description: "Cabeçalho Cache-Control: no-store. Toda vez o cliente precisa perguntar ao servidor de novo.",
        response: { 200: z.object({ boletim: z.string(), geradoEm: z.string(), cotacoes: z.array(CotacaoSchema) }) },
      },
    },
    async (_request, reply) => {
      reply.header("Cache-Control", "no-store");
      return { boletim: "Cotações ao vivo", geradoEm: new Date().toISOString(), cotacoes: await cotacoesOficiais() };
    },
  );

  app.get(
    "/etag",
    {
      schema: {
        tags: [TAG],
        summary: "Cotações com ETag (teste o 304 Not Modified)",
        description:
          'Copie o valor do cabeçalho ETag e repita a requisição com o cabeçalho If-None-Match: "<etag>". Se nada mudou, vem 304 sem corpo. Depois de alguém comprar uma batata, o ETag muda.',
        headers: z.object({ "if-none-match": z.string().optional() }),
        response: {
          200: z.object({ cotacoes: z.array(CotacaoSchema), dica: z.string() }),
          304: z.undefined().describe("Não mudou: use a sua cópia"),
        },
      },
    },
    async (request, reply) => {
      const cotacoes = await cotacoesOficiais();
      const etag = `"${createHash("sha1").update(JSON.stringify(cotacoes)).digest("hex").slice(0, 16)}"`;
      reply.header("ETag", etag).header("Cache-Control", "no-cache");

      const enviados = (request.headers["if-none-match"] ?? "").split(",").map((valor) => valor.trim().replace(/^W\//, ""));
      if (enviados.includes(etag)) return reply.code(304).send();

      return { cotacoes, dica: `Agora envie o cabeçalho If-None-Match: ${etag}` };
    },
  );
};

export default rotas;
