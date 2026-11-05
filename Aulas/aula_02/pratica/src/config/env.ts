import "dotenv/config";
import { z } from "zod";

const JWT_SECRET_PADRAO = "troque-este-segredo-em-producao";

const esquemaEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  // Opcional: com HTTPS_PORT definido, o servidor também atende HTTPS (só para rodar localmente).
  HTTPS_PORT: z.coerce.number().int().positive().optional(),
  HTTPS_CERT: z.string().default("certs/cert.pem"),
  HTTPS_KEY: z.string().default("certs/key.pem"),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  JWT_SECRET: z.string().min(8).default(JWT_SECRET_PADRAO),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
  ADMIN_PASSWORD: z.string().min(6).default("professor-demo"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  LOG_PRETTY: z
    .enum(["true", "false"])
    .default("true")
    .transform((valor) => valor === "true"),
});

const resultado = esquemaEnv.safeParse(process.env);

if (!resultado.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.prettifyError(resultado.error));
  process.exit(1);
}

export const env = resultado.data;

if (env.NODE_ENV === "production" && env.JWT_SECRET === JWT_SECRET_PADRAO) {
  console.warn("⚠️  JWT_SECRET está com o valor padrão. Rode: fly secrets set JWT_SECRET=...");
}
