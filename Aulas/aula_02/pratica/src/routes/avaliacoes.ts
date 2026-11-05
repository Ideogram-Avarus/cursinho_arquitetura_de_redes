import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { arredondar } from "@/lib/mercado";
import { ErroSchema } from "@/schemas/comum";

const TAG = "4. Enviando dados (POST)";

const AvaliacaoSchema = z.object({
  id: z.number().int(),
  apelido: z.string(),
  nota: z.number().int(),
  comentario: z.string().nullable(),
  criadoEm: z.string(),
});

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/avaliacoes",
    {
      schema: {
        tags: [TAG],
        summary: "Dê uma nota para a aula prática",
        description: "Use um APELIDO, não o seu nome completo. A nota vai de 1 a 5.",
        body: z
          .object({
            apelido: z.string().trim().min(2).max(30),
            nota: z.number().int().min(1).max(5),
            comentario: z.string().trim().max(280).optional(),
          })
          .meta({ examples: [{ apelido: "Batateiro", nota: 5, comentario: "Gostei de usar o Swagger!" }] }),
        response: { 201: AvaliacaoSchema, 400: ErroSchema },
      },
    },
    async (request, reply) => {
      const avaliacao = await app.prisma.avaliacao.create({ data: request.body });
      return reply.code(201).send({ ...avaliacao, criadoEm: avaliacao.criadoEm.toISOString() });
    },
  );

  app.get(
    "/avaliacoes",
    {
      schema: {
        tags: [TAG],
        summary: "Lista as últimas avaliações e a nota média",
        response: {
          200: z.object({ total: z.number().int(), media: z.number().nullable(), avaliacoes: z.array(AvaliacaoSchema) }),
        },
      },
    },
    async () => {
      const [agregado, avaliacoes] = await Promise.all([
        app.prisma.avaliacao.aggregate({ _avg: { nota: true }, _count: true }),
        app.prisma.avaliacao.findMany({ orderBy: { id: "desc" }, take: 50 }),
      ]);
      return {
        total: agregado._count,
        media: agregado._avg.nota === null ? null : arredondar(agregado._avg.nota),
        avaliacoes: avaliacoes.map((avaliacao) => ({ ...avaliacao, criadoEm: avaliacao.criadoEm.toISOString() })),
      };
    },
  );
};

export default rotas;
