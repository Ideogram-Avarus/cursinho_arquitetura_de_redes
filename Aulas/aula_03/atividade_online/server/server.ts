import { construirApp } from "./app.js";
import { env } from "./config.js";

const app = await construirApp();
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`📝 Atividade da aula 03 no ar na porta ${env.PORT}`);

for (const sinal of ["SIGINT", "SIGTERM"] as const) {
  process.on(sinal, async () => {
    app.log.info(`Recebi ${sinal}, desligando...`);
    await app.close();
    process.exit(0);
  });
}
