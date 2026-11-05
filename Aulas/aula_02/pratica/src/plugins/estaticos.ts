import { join } from "node:path";
import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";

export const PASTA_PUBLICA = join(__dirname, "..", "..", "public");

// serve: false → não cria rotas sozinho; só disponibiliza reply.sendFile() e reply.download()
// para as rotas de imagens, que validam o nome do arquivo antes.
export default fp(
  async (app) => {
    await app.register(fastifyStatic, { root: PASTA_PUBLICA, serve: false });
  },
  { name: "estaticos" },
);
