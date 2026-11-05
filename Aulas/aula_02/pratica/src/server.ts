import { construirApp } from "@/app";
import { env } from "@/config/env";
import { iniciarHttpsLocal } from "@/lib/https-local";
import { garantirDados } from "@/lib/seed";

async function iniciar() {
  const app = await construirApp();

  if (await garantirDados(app.prisma)) {
    app.log.info("🌱 Banco vazio: dados de demonstração criados.");
  }

  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`🥔 Bolsa de Batatas no ar! Documentação: http://localhost:${env.PORT}/docs`);

  const servidorHttps = await iniciarHttpsLocal(app);
  if (servidorHttps) {
    app.log.info(`🔒 HTTPS também no ar: https://localhost:${env.HTTPS_PORT}/docs (certificado autoassinado)`);
  }

  for (const sinal of ["SIGINT", "SIGTERM"] as const) {
    process.on(sinal, async () => {
      app.log.info(`Recebi ${sinal}, desligando...`);
      servidorHttps?.close();
      await app.close();
      process.exit(0);
    });
  }
}

iniciar().catch((erro) => {
  console.error("Falha ao iniciar o servidor:", erro);
  process.exit(1);
});
