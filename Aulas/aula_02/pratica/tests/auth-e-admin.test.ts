import jwt from "jsonwebtoken";
import type { App } from "@/app";
import { cliente, criarAppDeTeste, tokenDe, tokenDoAdmin } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

describe("POST /api/auth/registro", () => {
  it("cria a conta (201) com saldo inicial", async () => {
    const resposta = await cliente(app).post("/api/auth/registro").send({ usuario: "Batateiro99", senha: "123456" });
    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ usuario: "batateiro99", papel: "INVESTIDOR", saldo: 10000 });
    expect(resposta.body).not.toHaveProperty("senhaHash");
  });

  it("409 com usuário repetido", async () => {
    const resposta = await cliente(app).post("/api/auth/registro").send({ usuario: "aluno", senha: "123456" });
    expect(resposta.status).toBe(409);
  });

  it("400 com senha curta e usuário inválido", async () => {
    const resposta = await cliente(app).post("/api/auth/registro").send({ usuario: "a b", senha: "1" });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes).toHaveLength(2);
  });
});

describe("POST /api/auth/login", () => {
  it("devolve um token Bearer legível (JWT assinado, não criptografado)", async () => {
    const resposta = await cliente(app).post("/api/auth/login").send({ usuario: "aluno", senha: "senha-demo" });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ tipoToken: "Bearer", expiraEmSegundos: 900, usuario: { usuario: "aluno" } });
    const conteudo = jwt.decode(resposta.body.tokenAcesso) as jwt.JwtPayload;
    expect(conteudo).toMatchObject({ usuario: "aluno", papel: "INVESTIDOR" });
    expect(conteudo.aviso).toMatch(/ASSINADO/);
  });

  it("401 com senha errada", async () => {
    const resposta = await cliente(app).post("/api/auth/login").send({ usuario: "aluno", senha: "errada" });
    expect(resposta.status).toBe(401);
    expect(resposta.headers["www-authenticate"]).toBe("Bearer");
  });

  it("401 com usuário que não existe (mesma mensagem)", async () => {
    const resposta = await cliente(app).post("/api/auth/login").send({ usuario: "fantasma", senha: "qualquer" });
    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toBe("Usuário ou senha incorretos.");
  });

  it("400 sem corpo", async () => {
    expect((await cliente(app).post("/api/auth/login")).status).toBe(400);
  });
});

describe("GET /api/perfil", () => {
  it("401 sem token", async () => {
    const resposta = await cliente(app).get("/api/perfil");
    expect(resposta.status).toBe(401);
    expect(resposta.body.dica).toMatch(/Authorization: Bearer/);
  });

  it("401 com formato errado no Authorization", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).get("/api/perfil").set("Authorization", token);
    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toMatch(/formato errado/);
  });

  it("401 com token adulterado", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).get("/api/perfil").auth(`${token}x`, { type: "bearer" });
    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toBe("Token inválido.");
  });

  it("401 com token expirado", async () => {
    const expirado = jwt.sign({ sub: "1", usuario: "aluno", papel: "INVESTIDOR" }, "segredo-dos-testes", { expiresIn: -10 });
    const resposta = await cliente(app).get("/api/perfil").auth(expirado, { type: "bearer" });
    expect(resposta.status).toBe(401);
    expect(resposta.body.mensagem).toBe("Seu token expirou.");
  });

  it("200 com token válido", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).get("/api/perfil").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ usuario: "aluno", papel: "INVESTIDOR", saldo: 10000, totalDeOrdens: 0 });
  });
});

describe("POST /api/auth/renovar", () => {
  it("troca o token por um novo", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).post("/api/auth/renovar").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(200);
    expect(resposta.body.tokenAcesso).toEqual(expect.any(String));
  });

  it("401 sem token", async () => {
    expect((await cliente(app).post("/api/auth/renovar")).status).toBe(401);
  });
});

describe("GET /api/admin", () => {
  it("401 sem token", async () => {
    expect((await cliente(app).get("/api/admin")).status).toBe(401);
  });

  it("403 com token de aluno", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).get("/api/admin").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(403);
    expect(resposta.body.erro).toBe("Proibido");
  });

  it("200 com token do professor", async () => {
    const token = await tokenDoAdmin(app);
    const resposta = await cliente(app).get("/api/admin").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(200);
    expect(resposta.body.estatisticas.batatas).toBeGreaterThan(0);
  });
});

describe("POST /api/admin/reset", () => {
  it("403 para aluno", async () => {
    const token = await tokenDe(app);
    expect((await cliente(app).post("/api/admin/reset").auth(token, { type: "bearer" })).status).toBe(403);
  });

  it("apaga o que os alunos criaram e invalida os tokens antigos", async () => {
    await cliente(app).post("/api/auth/registro").send({ usuario: "temporario", senha: "123456" });
    const tokenAntigo = await tokenDe(app, "temporario", "123456");
    const tokenAdmin = await tokenDoAdmin(app);

    const resposta = await cliente(app).post("/api/admin/reset").auth(tokenAdmin, { type: "bearer" });
    expect(resposta.status).toBe(200);

    const login = await cliente(app).post("/api/auth/login").send({ usuario: "temporario", senha: "123456" });
    expect(login.status).toBe(401);
    const perfil = await cliente(app).get("/api/perfil").auth(tokenAntigo, { type: "bearer" });
    expect(perfil.status).toBe(401);
    expect(perfil.body.mensagem).toMatch(/não existe mais/);
  });

  it("um token antigo não vale para outra conta que recebeu o mesmo id", async () => {
    await cliente(app).post("/api/auth/registro").send({ usuario: "primeira", senha: "123456" });
    const tokenDaPrimeira = await tokenDe(app, "primeira", "123456");
    await cliente(app).post("/api/admin/reset").auth(await tokenDoAdmin(app), { type: "bearer" });
    await cliente(app).post("/api/auth/registro").send({ usuario: "segunda", senha: "123456" }); // mesmo id

    const perfil = await cliente(app).get("/api/perfil").auth(tokenDaPrimeira, { type: "bearer" });
    expect(perfil.status).toBe(401);
  });
});
