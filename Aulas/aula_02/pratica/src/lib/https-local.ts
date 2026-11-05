import { existsSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:https";
import type { App } from "@/app";
import { env } from "@/config/env";

/**
 * Sobe um segundo servidor, em HTTPS, que entrega as requisições para o mesmo app.
 * Serve para mostrar HTTP e HTTPS lado a lado rodando localmente.
 * No Fly.io não é usado: lá o HTTPS é feito pelo proxy da plataforma.
 */
export async function iniciarHttpsLocal(app: App): Promise<Server | undefined> {
  if (!env.HTTPS_PORT) return undefined;

  if (!existsSync(env.HTTPS_CERT) || !existsSync(env.HTTPS_KEY)) {
    app.log.warn(
      `HTTPS_PORT=${env.HTTPS_PORT} foi definido, mas não achei ${env.HTTPS_CERT} e ${env.HTTPS_KEY}. Rode: npm run certs:gerar`,
    );
    return undefined;
  }

  const servidor = createServer(
    { cert: readFileSync(env.HTTPS_CERT), key: readFileSync(env.HTTPS_KEY) },
    (req, res) => app.routing(req, res),
  );

  await new Promise<void>((resolve, reject) => {
    servidor.once("error", reject);
    servidor.listen(env.HTTPS_PORT, env.HOST, resolve);
  });

  return servidor;
}
