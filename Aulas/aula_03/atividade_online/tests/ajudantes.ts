import { copyFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { construirApp } from "../server/app";
import { criarPrisma } from "../server/lib/prisma";

export async function criarAppDeTeste() {
  const pasta = mkdtempSync(join(tmpdir(), "atividade-teste-"));
  const arquivo = join(pasta, "teste.db");
  copyFileSync("prisma/teste-modelo.db", arquivo);
  const app = await construirApp({ prisma: criarPrisma(`file:${arquivo}`), logger: false, limitePorMinuto: 100_000 });
  await app.ready();
  const http = () => request(app.server);
  return { app, http };
}

export type Http = Awaited<ReturnType<typeof criarAppDeTeste>>["http"];

export async function cadastrar(http: Http, usuario = "ana", nome = "Ana") {
  const r = await http().post("/api/auth/cadastro").send({ usuario, senha: "1234", nome });
  if (r.status !== 201) throw new Error(`cadastro falhou: ${r.status} ${JSON.stringify(r.body)}`);
  return r.body.token as string;
}

export const mudarFase = (http: Http, fase: string) => http().put("/api/professor/estado").send({ fase });
