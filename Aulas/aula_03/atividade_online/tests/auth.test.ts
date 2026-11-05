import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cadastrar, criarAppDeTeste, type Http } from "./ajudantes";

let ctx: Awaited<ReturnType<typeof criarAppDeTeste>>;
let http: Http;
beforeEach(async () => {
  ctx = await criarAppDeTeste();
  http = ctx.http;
});
afterEach(() => ctx.app.close());

describe("cadastro e login", () => {
  it("cria a conta (201), guarda o usuário em minúsculo e já devolve o token", async () => {
    const r = await http().post("/api/auth/cadastro").send({ usuario: " Ana.Silva ", senha: "1234", nome: "Ana" });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ usuario: "ana.silva", nome: "Ana" });
    expect(r.body.token).toBeTypeOf("string");
  });

  it("não deixa repetir o usuário (409)", async () => {
    await cadastrar(http, "ana");
    const r = await http().post("/api/auth/cadastro").send({ usuario: "ANA", senha: "9999", nome: "Outra" });
    expect(r.status).toBe(409);
    expect(r.body.erro).toBe("Usuário já existe");
  });

  it("recusa usuário com espaço e senha curta (400)", async () => {
    const r = await http().post("/api/auth/cadastro").send({ usuario: "ana silva", senha: "12", nome: "Ana" });
    expect(r.status).toBe(400);
    expect(r.body.detalhes.map((d: { campo: string }) => d.campo)).toEqual(["body.usuario", "body.senha"]);
  });

  it("login certo dá 200; senha errada dá 401", async () => {
    await cadastrar(http, "bia");
    expect((await http().post("/api/auth/login").send({ usuario: "bia", senha: "1234" })).status).toBe(200);
    const errado = await http().post("/api/auth/login").send({ usuario: "bia", senha: "0000" });
    expect(errado.status).toBe(401);
    expect(errado.body.mensagem).toBe("Usuário ou senha incorretos.");
  });

  it("limita 5 tentativas de login por minuto para o mesmo usuário (429), sem travar os outros", async () => {
    await cadastrar(http, "caio");
    for (let i = 0; i < 5; i++) await http().post("/api/auth/login").send({ usuario: "caio", senha: "errada" });
    const sexta = await http().post("/api/auth/login").send({ usuario: "caio", senha: "1234" });
    expect(sexta.status).toBe(429);
    expect(sexta.body.erro).toBe("Muitas requisições");
    await cadastrar(http, "duda");
    expect((await http().post("/api/auth/login").send({ usuario: "duda", senha: "1234" })).status).toBe(200);
  });

  it("rotas do aluno exigem token (401)", async () => {
    expect((await http().get("/api/eu")).status).toBe(401);
    expect((await http().get("/api/eu").set("Authorization", "Bearer lixo")).status).toBe(401);
  });

  it("o painel do professor é aberto (sem token)", async () => {
    expect((await http().get("/api/professor/resumo")).status).toBe(200);
    expect((await http().get("/api/professor/alunos")).status).toBe(200);
  });

  it("rota que não existe dá 404 em JSON", async () => {
    const r = await http().get("/api/nada");
    expect(r.status).toBe(404);
    expect(r.body.erro).toBe("Não encontrado");
  });
});
