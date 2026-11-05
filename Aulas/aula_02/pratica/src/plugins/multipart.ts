import multipart from "@fastify/multipart";
import fp from "fastify-plugin";

export const TAMANHO_MAXIMO_ARQUIVO = 1024 * 1024; // 1 MB

export default fp(
  async (app) => {
    await app.register(multipart, {
      limits: { fileSize: TAMANHO_MAXIMO_ARQUIVO, files: 1, fields: 5, parts: 6 },
    });
  },
  { name: "multipart" },
);
