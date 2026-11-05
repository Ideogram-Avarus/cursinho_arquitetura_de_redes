import type { FastifyServerOptions } from "fastify";
import { env } from "@/config/env";

export function opcoesDoLogger(): FastifyServerOptions["logger"] {
  if (env.NODE_ENV === "test") return false;

  return {
    level: env.LOG_LEVEL,
    // Nunca escrever tokens e senhas no log.
    redact: ["req.headers.authorization", "req.headers.cookie", "body.senha"],
    transport: env.LOG_PRETTY
      ? {
          target: "pino-pretty",
          options: {
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname,reqId,requisicao",
          },
        }
      : undefined,
  };
}
