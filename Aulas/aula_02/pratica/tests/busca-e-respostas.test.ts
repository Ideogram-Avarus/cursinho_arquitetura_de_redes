import type { App } from "@/app";
import { CODIGOS } from "@/routes/respostas";
import { cliente, criarAppDeTeste } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

describe("GET /api/busca", () => {
  it("decodifica o %20 e encontra pelo nome", async () => {
    const resposta = await cliente(app).get("/api/busca?q=batata%20doce");
    expect(resposta.status).toBe(200);
    expect(resposta.body.termo).toBe("batata doce");
    expect(resposta.body.urlRecebida).toBe("/api/busca?q=batata%20doce");
    expect(resposta.body.resultados.map((batata: { ticker: string }) => batata.ticker).sort()).toEqual(["DOCE3", "DOCR4"]);
  });

  it("encontra pela descrição", async () => {
    const resposta = await cliente(app).get("/api/busca?q=estrogonofe");
    expect(resposta.body.resultados[0].ticker).toBe("PALH3");
  });

  it("400 sem o parâmetro q", async () => {
    const resposta = await cliente(app).get("/api/busca");
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].campo).toBe("querystring.q");
  });
});

describe("GET /api/codigos/:codigo", () => {
  it.each(Object.keys(CODIGOS).map(Number))("responde com o código %i", async (codigo) => {
    const resposta = await cliente(app).get(`/api/codigos/${codigo}`).redirects(0);
    expect(resposta.status).toBe(codigo);
    if (codigo !== 204 && codigo !== 304) expect(resposta.body.nome).toBe(CODIGOS[codigo].nome);
  });

  it("3xx traz o cabeçalho Location", async () => {
    const resposta = await cliente(app).get("/api/codigos/301").redirects(0);
    expect(resposta.headers.location).toBe("/api/ola");
  });

  it("classifica a culpa nos erros 4xx e 5xx", async () => {
    expect((await cliente(app).get("/api/codigos/404")).body.categoria).toBe("4xx — Erro do cliente");
    expect((await cliente(app).get("/api/codigos/503")).body.categoria).toBe("5xx — Erro do servidor");
  });

  it("400 para código fora da lista", async () => {
    const resposta = await cliente(app).get("/api/codigos/299");
    expect(resposta.status).toBe(400);
  });
});

describe("GET /api/demora", () => {
  it("espera o tempo pedido", async () => {
    const inicio = Date.now();
    const resposta = await cliente(app).get("/api/demora?ms=150");
    expect(resposta.status).toBe(200);
    expect(resposta.body.esperouMs).toBe(150);
    expect(Date.now() - inicio).toBeGreaterThanOrEqual(140);
  });

  it("400 acima de 10 segundos", async () => {
    expect((await cliente(app).get("/api/demora?ms=60000")).status).toBe(400);
  });

  it("o cliente pode desistir antes (timeout)", async () => {
    await expect(cliente(app).get("/api/demora?ms=1000").timeout(100)).rejects.toThrow(/Timeout/);
  });
});

describe("GET /api/nao-encontrado e /api/bule", () => {
  it("404 de propósito", async () => {
    const resposta = await cliente(app).get("/api/nao-encontrado");
    expect(resposta.status).toBe(404);
  });

  it("418 I'm a teapot", async () => {
    const resposta = await cliente(app).get("/api/bule");
    expect(resposta.status).toBe(418);
    expect(resposta.body.erro).toBe("Sou um bule de chá");
  });
});
