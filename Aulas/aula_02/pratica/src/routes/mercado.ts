import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErroHttp, naoEncontrado } from "@/lib/erros";
import { arredondar, precoAposOrdem } from "@/lib/mercado";
import { ErroSchema, comToken } from "@/schemas/comum";

const TAG = "7. Mercado (com token)";

const OrdemSchema = z.object({
  id: z.number().int(),
  tipo: z.enum(["COMPRA", "VENDA"]),
  ticker: z.string(),
  quantidade: z.number().int(),
  precoUnitario: z.number(),
  total: z.number(),
  criadoEm: z.string(),
});

const rotas: FastifyPluginAsyncZod = async (app) => {
  /** Saldo + ações a preço de hoje. */
  async function montarCarteira(usuarioId: number) {
    const usuario = await app.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      include: { posicoes: { include: { batata: true }, orderBy: { batata: { ticker: "asc" } } } },
    });
    const posicoes = usuario.posicoes.map((posicao) => ({
      ticker: posicao.batata.ticker,
      nome: posicao.batata.nome,
      quantidade: posicao.quantidade,
      precoAtual: posicao.batata.preco,
      valorAtual: arredondar(posicao.quantidade * posicao.batata.preco),
    }));
    const valorEmAcoes = arredondar(posicoes.reduce((soma, posicao) => soma + posicao.valorAtual, 0));
    return {
      usuario: usuario.usuario,
      saldo: arredondar(usuario.saldo),
      valorEmAcoes,
      patrimonioTotal: arredondar(usuario.saldo + valorEmAcoes),
      posicoes,
    };
  }

  app.get(
    "/perfil",
    {
      schema: {
        tags: ["6. Autenticação"],
        summary: "Seu perfil (sem token → 401)",
        security: comToken,
        response: {
          200: z.object({
            id: z.number().int(),
            usuario: z.string(),
            papel: z.string(),
            saldo: z.number(),
            totalDeOrdens: z.number().int(),
            criadoEm: z.string(),
          }),
          401: ErroSchema,
        },
      },
      preHandler: app.autenticar,
    },
    async (request) => {
      const usuario = await app.prisma.usuario.findUniqueOrThrow({
        where: { id: request.usuario!.id },
        include: { _count: { select: { ordens: true } } },
      });
      return {
        id: usuario.id,
        usuario: usuario.usuario,
        papel: usuario.papel,
        saldo: arredondar(usuario.saldo),
        totalDeOrdens: usuario._count.ordens,
        criadoEm: usuario.criadoEm.toISOString(),
      };
    },
  );

  app.get(
    "/carteira",
    {
      schema: {
        tags: [TAG],
        summary: "Seu saldo e as batatas que você tem",
        security: comToken,
        response: {
          200: z.object({
            usuario: z.string(),
            saldo: z.number(),
            valorEmAcoes: z.number(),
            patrimonioTotal: z.number(),
            posicoes: z.array(
              z.object({
                ticker: z.string(),
                nome: z.string(),
                quantidade: z.number().int(),
                precoAtual: z.number(),
                valorAtual: z.number(),
              }),
            ),
          }),
          401: ErroSchema,
        },
      },
      preHandler: app.autenticar,
    },
    async (request) => montarCarteira(request.usuario!.id),
  );

  app.post(
    "/ordens",
    {
      schema: {
        tags: [TAG],
        summary: "Compra ou vende ações de uma batata",
        description:
          "Cada ação comprada sobe o preço 0,1% e cada ação vendida desce 0,1% (lei da oferta e da procura, simplificada).",
        security: comToken,
        body: z
          .object({
            ticker: z.string().trim().toUpperCase().min(1).max(6),
            tipo: z.enum(["compra", "venda"]).describe("compra ou venda"),
            quantidade: z.number().int().min(1).max(10_000),
          })
          .meta({ examples: [{ ticker: "FRIT3", tipo: "compra", quantidade: 10 }] }),
        response: {
          201: z.object({ mensagem: z.string(), ordem: OrdemSchema, saldoAtual: z.number(), novoPreco: z.number() }),
          400: ErroSchema,
          401: ErroSchema,
          404: ErroSchema,
          409: ErroSchema,
        },
      },
      preHandler: app.autenticar,
    },
    async (request, reply) => {
      const usuarioId = request.usuario!.id;
      const tipo = request.body.tipo === "compra" ? "COMPRA" : "VENDA";
      const { ticker, quantidade } = request.body;

      const resultado = await app.prisma.$transaction(async (tx) => {
        const batata = await tx.batata.findUnique({ where: { ticker } });
        if (!batata) throw naoEncontrado(`Não existe batata com o ticker ${ticker}.`, "Veja os tickers em GET /api/batatas.");

        const usuario = await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
        const posicao = await tx.posicao.findUnique({ where: { usuarioId_batataId: { usuarioId, batataId: batata.id } } });
        const total = arredondar(batata.preco * quantidade);

        if (tipo === "COMPRA") {
          if (usuario.saldo < total) {
            throw new ErroHttp(
              409,
              "Saldo insuficiente",
              `A compra custa R$ ${total.toFixed(2)}, mas você só tem R$ ${usuario.saldo.toFixed(2)}.`,
              "Compre menos ações ou venda alguma batata antes.",
            );
          }
          await tx.posicao.upsert({
            where: { usuarioId_batataId: { usuarioId, batataId: batata.id } },
            create: { usuarioId, batataId: batata.id, quantidade },
            update: { quantidade: { increment: quantidade } },
          });
          await tx.usuario.update({ where: { id: usuarioId }, data: { saldo: arredondar(usuario.saldo - total) } });
        } else {
          if (!posicao || posicao.quantidade < quantidade) {
            throw new ErroHttp(
              409,
              "Ações insuficientes",
              `Você tem ${posicao?.quantidade ?? 0} ações de ${ticker} e tentou vender ${quantidade}.`,
              "Confira suas ações em GET /api/carteira.",
            );
          }
          if (posicao.quantidade === quantidade) {
            await tx.posicao.delete({ where: { id: posicao.id } });
          } else {
            await tx.posicao.update({ where: { id: posicao.id }, data: { quantidade: { decrement: quantidade } } });
          }
          await tx.usuario.update({ where: { id: usuarioId }, data: { saldo: arredondar(usuario.saldo + total) } });
        }

        const novoPreco = precoAposOrdem(batata.preco, tipo, quantidade);
        await tx.batata.update({ where: { id: batata.id }, data: { preco: novoPreco } });

        const ordem = await tx.ordem.create({
          data: { tipo, quantidade, precoUnitario: batata.preco, total, usuarioId, batataId: batata.id },
        });
        const saldoAtual = (await tx.usuario.findUniqueOrThrow({ where: { id: usuarioId } })).saldo;
        return { ordem, novoPreco, saldoAtual };
      });

      const { ordem, novoPreco, saldoAtual } = resultado;
      return reply
        .code(201)
        .header("Location", "/api/ordens")
        .send({
          mensagem: `${tipo === "COMPRA" ? "Compra" : "Venda"} de ${quantidade} ações de ${ticker} realizada!`,
          ordem: { ...ordem, tipo, ticker, criadoEm: ordem.criadoEm.toISOString() },
          saldoAtual: arredondar(saldoAtual),
          novoPreco,
        });
    },
  );

  app.get(
    "/ordens",
    {
      schema: {
        tags: [TAG],
        summary: "Suas últimas ordens de compra e venda",
        security: comToken,
        response: { 200: z.object({ ordens: z.array(OrdemSchema) }), 401: ErroSchema },
      },
      preHandler: app.autenticar,
    },
    async (request) => {
      const ordens = await app.prisma.ordem.findMany({
        where: { usuarioId: request.usuario!.id },
        include: { batata: { select: { ticker: true } } },
        orderBy: { id: "desc" },
        take: 50,
      });
      return {
        ordens: ordens.map((ordem) => ({
          id: ordem.id,
          tipo: ordem.tipo as "COMPRA" | "VENDA",
          ticker: ordem.batata.ticker,
          quantidade: ordem.quantidade,
          precoUnitario: ordem.precoUnitario,
          total: ordem.total,
          criadoEm: ordem.criadoEm.toISOString(),
        })),
      };
    },
  );

  app.get(
    "/ranking",
    {
      schema: {
        tags: [TAG],
        summary: "Ranking dos investidores mais ricos (não precisa de token)",
        querystring: z.object({ limite: z.coerce.number().int().min(1).max(50).default(10) }),
        response: {
          200: z.object({
            ranking: z.array(
              z.object({ posicao: z.number().int(), usuario: z.string(), patrimonioTotal: z.number() }),
            ),
          }),
          400: ErroSchema,
        },
      },
    },
    async (request) => {
      const usuarios = await app.prisma.usuario.findMany({
        where: { papel: "INVESTIDOR" },
        include: { posicoes: { include: { batata: { select: { preco: true } } } } },
      });
      const ranking = usuarios
        .map((usuario) => ({
          usuario: usuario.usuario,
          patrimonioTotal: arredondar(
            usuario.saldo + usuario.posicoes.reduce((soma, posicao) => soma + posicao.quantidade * posicao.batata.preco, 0),
          ),
        }))
        .sort((a, b) => b.patrimonioTotal - a.patrimonioTotal)
        .slice(0, request.query.limite)
        .map((item, indice) => ({ posicao: indice + 1, ...item }));
      return { ranking };
    },
  );
};

export default rotas;
