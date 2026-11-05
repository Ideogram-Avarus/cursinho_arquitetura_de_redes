import "@/tipos";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import autoload from "@fastify/autoload";
import Fastify, { LogController } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Limitador } from "@/lib/limitador";
import { opcoesDoLogger } from "@/lib/logger";
import { criarPrisma, type Prisma } from "@/lib/prisma";

// Mensagens de validação do Zod em português.
z.config(z.locales.pt());

export interface OpcoesDoApp {
  prisma?: Prisma;
}

export async function construirApp(opcoes: OpcoesDoApp = {}) {
  const app = Fastify({
    logger: opcoesDoLogger(),
    // O log de cada requisição é feito em plugins/logs.ts, em uma linha só.
    logController: new LogController({ disableRequestLogging: true }),
    // No Fly.io a requisição passa por um proxy: confia no X-Forwarded-For/Proto.
    trustProxy: true,
    bodyLimit: 100 * 1024,
    genReqId: () => randomUUID().slice(0, 8),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Só aceitamos JSON (e multipart no upload): Content-Type: text/plain vira um 415 de verdade.
  app.removeContentTypeParser("text/plain");

  const prisma = opcoes.prisma ?? criarPrisma();
  app.decorate("prisma", prisma);
  app.decorate("limitador", new Limitador(5, 30_000));
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  // Plugins primeiro (CORS, Swagger, erros, logs...), depois as rotas em /api.
  await app.register(autoload, { dir: join(__dirname, "plugins") });
  await app.register(autoload, { dir: join(__dirname, "routes"), options: { prefix: "/api" } });

  // A raiz redireciona para a documentação: um 302 de verdade para os alunos verem.
  app.get("/", { schema: { hide: true } }, (_request, reply) => reply.redirect("/docs"));

  return app;
}

export type App = Awaited<ReturnType<typeof construirApp>>;
