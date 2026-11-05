import type { AlunoDoToken } from "./lib/auth.js";
import type { Prisma } from "./lib/prisma.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: Prisma;
    /** preHandler das rotas do aluno: exige "Authorization: Bearer <token>". */
    autenticar: (request: FastifyRequest) => Promise<void>;
  }
  interface FastifyRequest {
    aluno: AlunoDoToken;
  }
}
