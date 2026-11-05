import { existsSync } from "node:fs";
import { resolve } from "node:path";
import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";

// Em produção o Fastify serve o front compilado (dist/web). No dev quem serve é o Vite (porta 5173).
export const PASTA_WEB = resolve(process.cwd(), "dist", "web");

export default fp(
  async (app) => {
    const temFront = existsSync(resolve(PASTA_WEB, "index.html"));
    if (temFront) {
      await app.register(fastifyStatic, { root: PASTA_WEB, wildcard: false });
    }

    app.setNotFoundHandler((request, reply) => {
      const caminho = request.url.split("?")[0] ?? "/";
      // Rotas do React (/atividade, /professor...): devolve o index.html e o React Router resolve.
      if (temFront && request.method === "GET" && !caminho.startsWith("/api")) {
        return reply.type("text/html").sendFile("index.html");
      }
      return reply.code(404).send({
        status: 404,
        erro: "Não encontrado",
        mensagem: `A rota ${request.method} ${caminho} não existe.`,
      });
    });
  },
  { name: "estaticos" },
);
