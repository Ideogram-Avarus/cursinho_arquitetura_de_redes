import "dotenv/config";
import { z } from "zod";

const SEGREDO_PADRAO = "troque-este-segredo-em-producao";

const esquemaEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  JWT_SECRET: z.string().min(8).default(SEGREDO_PADRAO),
  // 8 horas: o token dura a aula inteira (4 h) com folga.
  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(8 * 3600),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  LOG_PRETTY: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const resultado = esquemaEnv.safeParse(process.env);
if (!resultado.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.prettifyError(resultado.error));
  process.exit(1);
}

export const env = resultado.data;

if (env.NODE_ENV === "production" && env.JWT_SECRET === SEGREDO_PADRAO) {
  console.warn("⚠️  JWT_SECRET está com o valor padrão. O scripts/subir-aula.ps1 cria um segredo aleatório.");
}
