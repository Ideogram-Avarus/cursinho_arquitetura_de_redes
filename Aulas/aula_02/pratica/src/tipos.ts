// Tipos extras que os plugins adicionam ao Fastify.
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UsuarioDoToken } from "@/lib/auth";
import type { Limitador } from "@/lib/limitador";
import type { Prisma } from "@/lib/prisma";

type PreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

declare module "fastify" {
  interface FastifyInstance {
    prisma: Prisma;
    limitador: Limitador;
    /** preHandler: exige "Authorization: Bearer <token>" válido (senão 401). */
    autenticar: PreHandler;
    /** preHandler: exige token de um usuário ADMIN (senão 401/403). */
    exigirAdmin: PreHandler;
    /** Métodos HTTP que existem para um caminho (usado no 405 e no OPTIONS). */
    metodosPermitidos: (caminho: string) => string[];
  }

  interface FastifyRequest {
    usuario?: UsuarioDoToken;
  }
}

export {};
