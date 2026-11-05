import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const TAG = "1. Primeiros passos";
const { version: VERSAO } = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
const INICIO = Date.now();

/** Cabeçalhos que nunca devolvemos inteiros (credenciais). */
const CABECALHOS_SENSIVEIS = ["authorization", "cookie"];

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/ola",
    {
      schema: {
        tags: [TAG],
        summary: "Olá, mundo! O GET mais simples possível",
        response: { 200: z.object({ mensagem: z.string(), horario: z.string() }) },
      },
    },
    async () => ({
      mensagem: "Olá, investidor! Bem-vindo à Bolsa de Batatas 🥔",
      horario: new Date().toISOString(),
    }),
  );

  app.get(
    "/requisicao",
    {
      schema: {
        tags: [TAG],
        summary: "Mostra o que o servidor recebeu na sua requisição",
        description:
          "Compare o User-Agent do navegador, do curl e do Postman. Lembre: tudo isso foi o CLIENTE que enviou, então o servidor não pode confiar cegamente.",
      },
    },
    async (request) => {
      const cabecalhos = Object.fromEntries(
        Object.entries(request.headers).map(([nome, valor]) => [
          nome,
          CABECALHOS_SENSIVEIS.includes(nome) ? "*** escondido ***" : valor,
        ]),
      );

      return {
        metodo: request.method,
        url: request.url,
        caminho: request.url.split("?")[0],
        query: request.query,
        protocolo: `HTTP/${request.raw.httpVersion}`,
        userAgent: request.headers["user-agent"] ?? null,
        accept: request.headers.accept ?? null,
        contentType: request.headers["content-type"] ?? null,
        ip: request.ip,
        idRequisicao: request.id,
        cabecalhos,
        observacao:
          "O 'protocolo' é o que chegou na aplicação. No Fly.io existe um proxy no meio, então o seu navegador pode ter usado HTTP/2 até o proxy e o proxy HTTP/1.1 até aqui.",
      };
    },
  );

  app.get(
    "/status",
    {
      schema: {
        tags: [TAG],
        summary: "Saúde do serviço (monitoramento)",
        description: "Responde 200 se a API e o banco de dados estão funcionando, ou 503 se o banco falhar.",
      },
    },
    async (_request, reply) => {
      let banco = "ok";
      try {
        await app.prisma.batata.count();
      } catch {
        banco = "fora do ar";
      }

      return reply.code(banco === "ok" ? 200 : 503).send({
        status: banco === "ok" ? "ok" : "degradado",
        servico: "bolsa-de-batatas",
        versao: VERSAO,
        banco,
        tempoNoArSegundos: Math.round((Date.now() - INICIO) / 1000),
        horario: new Date().toISOString(),
      });
    },
  );
};

export default rotas;
