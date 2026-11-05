import type { App } from "@/app";
import { cliente, criarAppDeTeste } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

describe("GET /api/ola", () => {
  it("responde 200 com mensagem em JSON", async () => {
    const resposta = await cliente(app).get("/api/ola");
    expect(resposta.status).toBe(200);
    expect(resposta.headers["content-type"]).toMatch(/application\/json/);
    expect(resposta.headers["x-request-id"]).toBeDefined();
    expect(resposta.body.mensagem).toMatch(/Bolsa de Batatas/);
    expect(new Date(resposta.body.horario).toString()).not.toBe("Invalid Date");
  });
});

describe("GET /api/requisicao", () => {
  it("devolve método, User-Agent e query recebidos", async () => {
    const resposta = await cliente(app)
      .get("/api/requisicao?turma=2a")
      .set("User-Agent", "Navegador-do-Batman")
      .set("Accept", "application/json");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      metodo: "GET",
      caminho: "/api/requisicao",
      query: { turma: "2a" },
      userAgent: "Navegador-do-Batman",
      accept: "application/json",
      protocolo: "HTTP/1.1",
    });
  });

  it("esconde o cabeçalho Authorization", async () => {
    const resposta = await cliente(app).get("/api/requisicao").set("Authorization", "Bearer segredo");
    expect(resposta.body.cabecalhos.authorization).toBe("*** escondido ***");
  });
});

describe("GET /api/status", () => {
  it("informa que a API e o banco estão ok", async () => {
    const resposta = await cliente(app).get("/api/status");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ status: "ok", banco: "ok", servico: "bolsa-de-batatas" });
  });
});

describe("Infraestrutura", () => {
  it("GET / redireciona para a documentação (302)", async () => {
    const resposta = await cliente(app).get("/");
    expect(resposta.status).toBe(302);
    expect(resposta.headers.location).toBe("/docs");
  });

  it("rota inexistente responde 404 em português", async () => {
    const resposta = await cliente(app).get("/api/nao-existe-mesmo");
    expect(resposta.status).toBe(404);
    expect(resposta.body).toMatchObject({ status: 404, erro: "Não encontrado" });
  });

  it("método errado em rota existente responde 405 com Allow", async () => {
    const resposta = await cliente(app).delete("/api/ola");
    expect(resposta.status).toBe(405);
    expect(resposta.headers.allow).toBe("GET, HEAD, OPTIONS");
  });

  it("OPTIONS lista os métodos aceitos", async () => {
    const resposta = await cliente(app).options("/api/ola");
    expect(resposta.status).toBe(204);
    expect(resposta.headers.allow).toBe("GET, HEAD, OPTIONS");
  });

  it("HEAD devolve só os cabeçalhos", async () => {
    const resposta = await cliente(app).head("/api/ola");
    expect(resposta.status).toBe(200);
    expect(resposta.text).toBeUndefined();
  });

  it("preflight de CORS continua funcionando", async () => {
    const resposta = await cliente(app)
      .options("/api/ola")
      .set("Origin", "https://hoppscotch.io")
      .set("Access-Control-Request-Method", "GET");
    expect(resposta.status).toBe(204);
    expect(resposta.headers["access-control-allow-origin"]).toBe("https://hoppscotch.io");
  });

  it("documentação OpenAPI é gerada", async () => {
    const resposta = await cliente(app).get("/docs/json");
    expect(resposta.status).toBe(200);
    expect(resposta.body.info.title).toMatch(/Bolsa de Batatas/);
    expect(resposta.body.paths["/api/ola"]).toBeDefined();
  });
});
