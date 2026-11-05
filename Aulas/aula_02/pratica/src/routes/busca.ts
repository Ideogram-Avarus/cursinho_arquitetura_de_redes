import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErroSchema } from "@/schemas/comum";

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/busca",
    {
      schema: {
        tags: ["2. Parâmetros de URL"],
        summary: "Pesquisa batatas pelo nome ou descrição",
        description:
          "Teste com espaço: /api/busca?q=batata doce. O navegador troca o espaço por %20, mas o servidor recebe o texto decodificado.",
        querystring: z.object({ q: z.string().trim().min(1).max(100).describe("Texto a pesquisar") }),
        response: {
          200: z.object({
            termo: z.string(),
            urlRecebida: z.string(),
            quantidade: z.number().int(),
            resultados: z.array(z.object({ id: z.number(), ticker: z.string(), nome: z.string(), preco: z.number() })),
            dica: z.string(),
          }),
          400: ErroSchema,
        },
      },
    },
    async (request) => {
      const termo = request.query.q;
      const resultados = await app.prisma.batata.findMany({
        where: { OR: [{ nome: { contains: termo } }, { descricao: { contains: termo } }] },
        select: { id: true, ticker: true, nome: true, preco: true },
        orderBy: { nome: "asc" },
        take: 20,
      });

      return {
        termo,
        urlRecebida: request.url,
        quantidade: resultados.length,
        resultados,
        dica: "Compare 'urlRecebida' (com %20) e 'termo' (com espaço): a URL não aceita espaço, então ele é codificado.",
      };
    },
  );
};

export default rotas;
