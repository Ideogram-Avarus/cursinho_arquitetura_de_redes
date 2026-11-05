import request from "supertest";
import { type App, construirApp } from "@/app";
import { USUARIO_DEMO, resetarDados } from "@/lib/seed";

export const SENHA_ADMIN = "senha-do-professor";

/** Sobe o app numa porta aleatória do localhost, com o banco de teste zerado. */
export async function criarAppDeTeste() {
  const app = await construirApp();
  // Escutando de verdade, o supertest não precisa abrir/fechar um servidor por requisição.
  await app.listen({ port: 0, host: "127.0.0.1" });
  await resetarDados(app.prisma);
  app.limitador.limpar();
  return app;
}

export const cliente = (app: App) => request(app.server);

export async function tokenDe(app: App, usuario = USUARIO_DEMO.usuario, senha = USUARIO_DEMO.senha) {
  const resposta = await cliente(app).post("/api/auth/login").send({ usuario, senha });
  if (resposta.status !== 200) throw new Error(`Login falhou: ${JSON.stringify(resposta.body)}`);
  return resposta.body.tokenAcesso as string;
}

export const tokenDoAdmin = (app: App) => tokenDe(app, "professor", SENHA_ADMIN);
