import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { alunoDoCabecalho } from "../lib/auth.js";

// Na escola, a turma toda sai pela MESMA internet (o mesmo IP público). Por isso o limite
// conta por aluno logado (pelo token) e só cai no IP para quem não está logado.
export default fp(
  async (app, opcoes: { max?: number }) => {
    await app.register(rateLimit, {
      global: true,
      max: opcoes.max ?? 600,
      timeWindow: "1 minute",
      keyGenerator: (request) => {
        const aluno = alunoDoCabecalho(request.headers.authorization);
        return aluno ? `aluno:${aluno.id}` : `ip:${request.ip}`;
      },
      errorResponseBuilder: (_request, contexto) => ({
        statusCode: 429,
        status: 429,
        erro: "Muitas requisições",
        mensagem: `Calma! Tente de novo em ${Math.ceil(contexto.ttl / 1000)} s.`,
      }),
    });
  },
  { name: "limites" },
);
