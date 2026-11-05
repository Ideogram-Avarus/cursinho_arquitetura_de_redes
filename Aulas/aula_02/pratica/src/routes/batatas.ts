import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { conflito, naoEncontrado, proibido, requisicaoInvalida } from "@/lib/erros";
import { serializarBatata } from "@/lib/mercado";
import {
  BatataSchema,
  ErroSchema,
  IdParamsSchema,
  PaginacaoQuerySchema,
  PaginacaoSchema,
  SetorSchema,
  paginar,
} from "@/schemas/comum";

const TAG_LEITURA = "2. Parâmetros de URL";
const TAG_CRIACAO = "4. Enviando dados (POST)";
const TAG_ALTERACAO = "5. Alterar e apagar";

const ListaQuerySchema = PaginacaoQuerySchema.extend({
  setor: SetorSchema.optional(),
  precoMin: z.coerce.number().min(0).optional().describe("Preço mínimo"),
  precoMax: z.coerce.number().min(0).optional().describe("Preço máximo"),
  busca: z.string().trim().min(1).max(50).optional().describe("Parte do nome da batata"),
  ordenarPor: z.enum(["id", "ticker", "nome", "preco"]).default("id"),
  ordem: z.enum(["asc", "desc"]).default("asc"),
});

const CamposEditaveisSchema = z.object({
  ticker: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}\d{1,2}$/, "O ticker deve ter 4 letras e 1 ou 2 números. Exemplo: BATA3")
    .describe("Código da ação na bolsa: 4 letras + 1 ou 2 números"),
  nome: z.string().trim().min(2).max(60),
  setor: SetorSchema,
  preco: z.number().positive().max(100_000).describe("Preço da ação em reais"),
  descricao: z.string().trim().max(280).optional(),
});

const NovaBatataSchema = CamposEditaveisSchema.extend({
  criadoPor: z.string().trim().min(2).max(40).optional().describe("Nome da dupla que criou a batata"),
});

const ExemploNovaBatata = {
  ticker: "BATA3",
  nome: "Batata da Nossa Dupla",
  setor: "gourmet",
  preco: 10.5,
  descricao: "A batata mais promissora do pregão",
  criadoPor: "Ana e Léo",
};

const rotas: FastifyPluginAsyncZod = async (app) => {
  /** Busca a batata e garante que ela pode ser alterada (não é oficial). */
  async function batataEditavel(id: number) {
    const batata = await app.prisma.batata.findUnique({ where: { id } });
    if (!batata) throw naoEncontrado(`Não existe batata com id ${id}.`, "Liste as batatas em GET /api/batatas.");
    if (batata.oficial) {
      throw proibido(
        `A batata ${batata.ticker} é oficial da bolsa e não pode ser alterada nem apagada.`,
        "Crie a sua própria batata com POST /api/batatas e altere ela!",
      );
    }
    return batata;
  }

  async function garantirTickerLivre(ticker: string, idAtual?: number) {
    const existente = await app.prisma.batata.findUnique({ where: { ticker } });
    if (existente && existente.id !== idAtual) {
      throw conflito(`Já existe uma batata com o ticker ${ticker}.`, "Escolha outro ticker. Isso é um 409 Conflict.");
    }
  }

  app.get(
    "/batatas",
    {
      schema: {
        tags: [TAG_LEITURA],
        summary: "Lista as batatas da bolsa, com filtros e paginação",
        description:
          "Teste a query string: /api/batatas?setor=processada&precoMin=5&ordenarPor=preco&ordem=desc&pagina=1&limite=5",
        querystring: ListaQuerySchema,
        response: {
          200: z.object({ dados: z.array(BatataSchema), paginacao: PaginacaoSchema }),
          400: ErroSchema,
        },
      },
    },
    async (request) => {
      const { setor, precoMin, precoMax, busca, ordenarPor, ordem, pagina, limite } = request.query;
      if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
        throw requisicaoInvalida("precoMin não pode ser maior que precoMax.");
      }

      const where: Prisma.BatataWhereInput = {
        setor,
        preco: { gte: precoMin, lte: precoMax },
        nome: busca ? { contains: busca } : undefined,
      };

      const [total, batatas] = await Promise.all([
        app.prisma.batata.count({ where }),
        app.prisma.batata.findMany({
          where,
          orderBy: { [ordenarPor]: ordem },
          skip: (pagina - 1) * limite,
          take: limite,
        }),
      ]);

      return { dados: batatas.map(serializarBatata), paginacao: paginar(pagina, limite, total) };
    },
  );

  app.get(
    "/batatas/:id",
    {
      schema: {
        tags: [TAG_LEITURA],
        summary: "Detalhes de uma batata (parâmetro de caminho)",
        description: "Teste /api/batatas/1 (existe) e /api/batatas/99999 (404).",
        params: IdParamsSchema,
        response: { 200: BatataSchema, 400: ErroSchema, 404: ErroSchema },
      },
    },
    async (request) => {
      const batata = await app.prisma.batata.findUnique({ where: { id: request.params.id } });
      if (!batata) {
        throw naoEncontrado(`Não existe batata com id ${request.params.id}.`, "Liste as batatas em GET /api/batatas.");
      }
      return serializarBatata(batata);
    },
  );

  app.post(
    "/batatas",
    {
      schema: {
        tags: [TAG_CRIACAO],
        summary: "Abre o capital de uma batata nova (cria um recurso)",
        description: "Responde 201 Created com o cabeçalho Location apontando para a batata criada.",
        body: NovaBatataSchema.meta({ examples: [ExemploNovaBatata] }),
        response: { 201: BatataSchema, 400: ErroSchema, 409: ErroSchema },
      },
    },
    async (request, reply) => {
      await garantirTickerLivre(request.body.ticker);
      const batata = await app.prisma.batata.create({ data: { ...request.body, oficial: false } });
      return reply.code(201).header("Location", `/api/batatas/${batata.id}`).send(serializarBatata(batata));
    },
  );

  app.put(
    "/batatas/:id",
    {
      schema: {
        tags: [TAG_ALTERACAO],
        summary: "Substitui TODOS os dados de uma batata",
        description: "No PUT você manda o recurso inteiro. Campos opcionais que não forem enviados são apagados.",
        params: IdParamsSchema,
        body: CamposEditaveisSchema.meta({ examples: [{ ...ExemploNovaBatata, criadoPor: undefined, preco: 12 }] }),
        response: { 200: BatataSchema, 400: ErroSchema, 403: ErroSchema, 404: ErroSchema, 409: ErroSchema },
      },
    },
    async (request) => {
      await batataEditavel(request.params.id);
      await garantirTickerLivre(request.body.ticker, request.params.id);
      const batata = await app.prisma.batata.update({
        where: { id: request.params.id },
        data: { ...request.body, descricao: request.body.descricao ?? null },
      });
      return serializarBatata(batata);
    },
  );

  app.patch(
    "/batatas/:id",
    {
      schema: {
        tags: [TAG_ALTERACAO],
        summary: "Altera SÓ ALGUNS dados de uma batata",
        description: 'No PATCH você manda só o que muda. Exemplo: {"preco": 99.9}',
        params: IdParamsSchema,
        body: CamposEditaveisSchema.partial().meta({ examples: [{ preco: 99.9 }] }),
        response: { 200: BatataSchema, 400: ErroSchema, 403: ErroSchema, 404: ErroSchema, 409: ErroSchema },
      },
    },
    async (request) => {
      if (Object.keys(request.body).length === 0) {
        throw requisicaoInvalida("Envie pelo menos um campo para alterar.", 'Exemplo: {"preco": 99.9}');
      }
      await batataEditavel(request.params.id);
      if (request.body.ticker) await garantirTickerLivre(request.body.ticker, request.params.id);
      const batata = await app.prisma.batata.update({ where: { id: request.params.id }, data: request.body });
      return serializarBatata(batata);
    },
  );

  app.delete(
    "/batatas/:id",
    {
      schema: {
        tags: [TAG_ALTERACAO],
        summary: "Apaga uma batata",
        description: "Responde 204 No Content: deu certo e não tem corpo na resposta.",
        params: IdParamsSchema,
        response: { 204: z.undefined().describe("Apagada"), 403: ErroSchema, 404: ErroSchema },
      },
    },
    async (request, reply) => {
      await batataEditavel(request.params.id);
      await app.prisma.batata.delete({ where: { id: request.params.id } });
      return reply.code(204).send();
    },
  );
};

export default rotas;
