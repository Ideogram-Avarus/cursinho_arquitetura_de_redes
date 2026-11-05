import "./tipos.js";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "./config.js";
import { criarPrisma, type Prisma } from "./lib/prisma.js";
import autenticacao from "./plugins/autenticacao.js";
import erros from "./plugins/erros.js";
import estaticos from "./plugins/estaticos.js";
import limites from "./plugins/limites.js";
import swagger from "./plugins/swagger.js";
import aluno from "./routes/aluno.js";
import avaliacoes from "./routes/avaliacoes.js";
import auth from "./routes/auth.js";
import exportar from "./routes/exportar.js";
import professor from "./routes/professor.js";
import publico from "./routes/publico.js";

// Mensagens de validação do Zod em português.
z.config(z.locales.pt());

export interface OpcoesDoApp {
  prisma?: Prisma;
  logger?: boolean;
  limitePorMinuto?: number;
}

export async function construirApp(opcoes: OpcoesDoApp = {}) {
  const logger =
    opcoes.logger === false
      ? false
      : {
          level: env.LOG_LEVEL,
          ...(env.LOG_PRETTY && {
            transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname,reqId" } },
          }),
        };

  const app = Fastify({
    logger,
    trustProxy: true, // no Fly a requisição passa por um proxy
    bodyLimit: 100 * 1024,
    genReqId: () => randomUUID().slice(0, 8),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.removeContentTypeParser("text/plain");

  const prisma = opcoes.prisma ?? criarPrisma();
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => prisma.$disconnect());

  await app.register(erros);
  await app.register(limites, { max: opcoes.limitePorMinuto });
  await app.register(autenticacao);
  // Antes das rotas: o Swagger lê o schema de cada rota quando ela é criada.
  await app.register(swagger);
  await app.register(estaticos);

  await app.register(
    async (api) => {
      await api.register(publico);
      await api.register(auth);
      await api.register(professor);
      await api.register(exportar);
      await api.register(avaliacoes);
      // Por último: o hook de login do aluno vale só dentro deste plugin.
      await api.register(aluno);
    },
    { prefix: "/api" },
  );

  return app;
}

export type App = Awaited<ReturnType<typeof construirApp>>;
