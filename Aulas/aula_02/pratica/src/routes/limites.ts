import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { verificarToken } from "@/lib/auth";
import { ErroHttp, naoEncontrado } from "@/lib/erros";
import { gerarHistorico } from "@/lib/historico";
import { ErroSchema, PaginacaoQuerySchema, PaginacaoSchema, paginar } from "@/schemas/comum";

const TAG = "11. Limites e paginação";

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/limite",
    {
      schema: {
        tags: [TAG],
        summary: "Aceita só 5 requisições a cada 30 segundos (depois: 429)",
        description:
          "O limite é contado por usuário (se mandar token), pelo cabeçalho X-Aluno (se mandar) ou pelo IP. Atenção: o laboratório inteiro sai pelo mesmo IP!",
        headers: z.object({ "x-aluno": z.string().max(40).optional().describe("Seu apelido, para ter um limite só seu") }),
        response: {
          200: z.object({
            mensagem: z.string(),
            limite: z.number().int(),
            restantes: z.number().int(),
            identificadoPor: z.string(),
          }),
          429: ErroSchema,
        },
      },
    },
    async (request, reply) => {
      let chave = `ip:${request.ip}`;
      const [tipo, token] = (request.headers.authorization ?? "").split(" ");
      if (tipo === "Bearer" && token) {
        try {
          chave = `usuário:${verificarToken(token).usuario}`;
        } catch {
          // Token inválido: conta pelo X-Aluno ou IP.
        }
      }
      if (chave.startsWith("ip:") && request.headers["x-aluno"]) chave = `aluno:${request.headers["x-aluno"]}`;

      const { limitador } = app;
      const { permitido, restantes, segundosParaReiniciar } = limitador.registrar(chave);
      const cabecalhos = {
        "X-RateLimit-Limit": String(limitador.limite),
        "X-RateLimit-Remaining": String(restantes),
        "X-RateLimit-Reset": String(segundosParaReiniciar),
      };

      if (!permitido) {
        throw new ErroHttp(
          429,
          "Pedidos demais",
          `Você passou do limite de ${limitador.limite} requisições em ${limitador.janelaMs / 1000} segundos.`,
          `Espere ${segundosParaReiniciar} segundos (cabeçalho Retry-After).`,
          { ...cabecalhos, "Retry-After": String(segundosParaReiniciar) },
        );
      }

      return reply.headers(cabecalhos).send({
        mensagem: "Requisição aceita.",
        limite: limitador.limite,
        restantes,
        identificadoPor: chave,
      });
    },
  );

  app.get(
    "/historico",
    {
      schema: {
        tags: [TAG],
        summary: "Histórico simulado de pregões de uma batata (paginado)",
        description: "São 365 dias de histórico. Teste: /api/historico?ticker=FRIT3&pagina=2&limite=30",
        querystring: PaginacaoQuerySchema.extend({
          ticker: z.string().trim().toUpperCase().min(1).max(6).describe("Ticker da batata, ex.: FRIT3"),
          limite: z.coerce.number().int().min(1).max(100).default(30),
        }),
        response: {
          200: z.object({
            ticker: z.string(),
            nome: z.string(),
            dados: z.array(
              z.object({
                data: z.string(),
                abertura: z.number(),
                fechamento: z.number(),
                maxima: z.number(),
                minima: z.number(),
                volume: z.number().int(),
              }),
            ),
            paginacao: PaginacaoSchema,
          }),
          400: ErroSchema,
          404: ErroSchema,
        },
      },
    },
    async (request) => {
      const { ticker, pagina, limite } = request.query;
      const batata = await app.prisma.batata.findUnique({ where: { ticker } });
      if (!batata) throw naoEncontrado(`Não existe batata com o ticker ${ticker}.`, "Veja os tickers em GET /api/batatas.");

      const historico = gerarHistorico(ticker, batata.preco);
      const inicio = (pagina - 1) * limite;
      return {
        ticker,
        nome: batata.nome,
        dados: historico.slice(inicio, inicio + limite),
        paginacao: paginar(pagina, limite, historico.length),
      };
    },
  );
};

export default rotas;
