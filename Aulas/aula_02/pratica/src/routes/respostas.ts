import { setTimeout as esperar } from "node:timers/promises";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { requisicaoInvalida } from "@/lib/erros";
import { ErroSchema } from "@/schemas/comum";

const TAG = "3. Respostas e erros";

interface InfoCodigo {
  nome: string;
  significado: string;
  cabecalhos?: Record<string, string>;
}

/** Códigos que o /api/codigos/:codigo sabe simular (o servidor nunca falha de verdade). */
export const CODIGOS: Record<number, InfoCodigo> = {
  200: { nome: "OK", significado: "Deu certo." },
  201: { nome: "Created", significado: "Um recurso foi criado. Normalmente vem com o cabeçalho Location." },
  204: { nome: "No Content", significado: "Deu certo e não há nada no corpo da resposta." },
  301: {
    nome: "Moved Permanently",
    significado: "O recurso mudou de endereço para sempre. Veja o cabeçalho Location.",
    cabecalhos: { Location: "/api/ola" },
  },
  302: {
    nome: "Found",
    significado: "O recurso está temporariamente em outro endereço. Veja o cabeçalho Location.",
    cabecalhos: { Location: "/api/ola" },
  },
  304: { nome: "Not Modified", significado: "Não mudou desde a última vez: use a cópia do seu cache." },
  400: { nome: "Bad Request", significado: "O pedido está mal feito (JSON quebrado, campo faltando...)." },
  401: {
    nome: "Unauthorized",
    significado: "Não sei QUEM você é: falta o login ou o token.",
    cabecalhos: { "WWW-Authenticate": "Bearer" },
  },
  403: { nome: "Forbidden", significado: "Sei quem você é, mas você NÃO PODE fazer isso." },
  404: { nome: "Not Found", significado: "Esse recurso não existe." },
  405: {
    nome: "Method Not Allowed",
    significado: "O endereço existe, mas não aceita esse método. Veja o cabeçalho Allow.",
    cabecalhos: { Allow: "GET" },
  },
  409: { nome: "Conflict", significado: "Conflito com o estado atual (ex.: ticker já cadastrado)." },
  418: { nome: "I'm a teapot", significado: "Sou um bule de chá. Piada de 1º de abril de 1998 que virou tradição." },
  429: {
    nome: "Too Many Requests",
    significado: "Pedidos demais. Espere o tempo do cabeçalho Retry-After.",
    cabecalhos: { "Retry-After": "30" },
  },
  500: { nome: "Internal Server Error", significado: "O servidor deu erro (um bug, por exemplo)." },
  502: { nome: "Bad Gateway", significado: "Um intermediário (proxy) recebeu uma resposta inválida do servidor." },
  503: {
    nome: "Service Unavailable",
    significado: "Servidor fora do ar, sobrecarregado ou em manutenção.",
    cabecalhos: { "Retry-After": "30" },
  },
  504: { nome: "Gateway Timeout", significado: "O servidor demorou demais para responder ao intermediário." },
};

function categoria(codigo: number) {
  if (codigo < 300) return { categoria: "2xx — Sucesso", culpa: null };
  if (codigo < 400) return { categoria: "3xx — Redirecionamento", culpa: null };
  if (codigo < 500) return { categoria: "4xx — Erro do cliente", culpa: "do cliente: revise a sua requisição" };
  return { categoria: "5xx — Erro do servidor", culpa: "do servidor: não adianta mudar a requisição" };
}

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/codigos/:codigo",
    {
      schema: {
        tags: [TAG],
        summary: "Responde com o código de status que você escolher",
        description: `Códigos disponíveis: ${Object.keys(CODIGOS).join(", ")}. É só uma simulação: nada quebra de verdade.`,
        params: z.object({ codigo: z.coerce.number().int().describe("Código de status HTTP") }),
      },
    },
    async (request, reply) => {
      const { codigo } = request.params;
      const info = CODIGOS[codigo];
      if (!info) {
        throw requisicaoInvalida(
          `O código ${codigo} não está na lista de simulação.`,
          `Use um destes: ${Object.keys(CODIGOS).join(", ")}`,
        );
      }

      reply.code(codigo).headers(info.cabecalhos ?? {});
      // 204 e 304 não podem ter corpo.
      if (codigo === 204 || codigo === 304) return reply.send();
      return reply.send({ status: codigo, nome: info.nome, significado: info.significado, ...categoria(codigo) });
    },
  );

  app.get(
    "/demora",
    {
      schema: {
        tags: [TAG],
        summary: "Responde depois de alguns milissegundos (latência e timeout)",
        description:
          "Teste o timeout do cliente: curl.exe --max-time 2 \"https://<app>.fly.dev/api/demora?ms=3000\"",
        querystring: z.object({
          ms: z.coerce.number().int().min(0).max(10_000).default(2000).describe("Atraso em milissegundos (máx. 10000)"),
        }),
        response: { 200: z.object({ mensagem: z.string(), esperouMs: z.number() }), 400: ErroSchema },
      },
    },
    async (request) => {
      await esperar(request.query.ms);
      return { mensagem: "Pronto, demorei mas cheguei!", esperouMs: request.query.ms };
    },
  );

  app.get(
    "/nao-encontrado",
    {
      schema: { tags: [TAG], summary: "Sempre responde 404 Not Found", response: { 404: ErroSchema } },
    },
    async (_request, reply) =>
      reply.code(404).send({
        status: 404,
        erro: "Não encontrado",
        mensagem: "Este endpoint sempre responde 404, de propósito.",
        dica: "Repare: 404 é um erro do CLIENTE (4xx). O servidor está funcionando bem.",
      }),
  );

  app.get(
    "/bule",
    {
      schema: { tags: [TAG], summary: "418 I'm a teapot: sou um bule de chá", response: { 418: ErroSchema } },
    },
    async (_request, reply) =>
      reply.code(418).send({
        status: 418,
        erro: "Sou um bule de chá",
        mensagem: "Eu sou um bule: não faço café... nem batata frita.",
        dica: "O 418 nasceu como piada de 1º de abril em 1998 e nunca saiu do HTTP.",
      }),
  );
};

export default rotas;
