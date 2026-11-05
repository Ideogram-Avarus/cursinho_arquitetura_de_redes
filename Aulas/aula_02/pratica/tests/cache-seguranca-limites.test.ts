import type { App } from "@/app";
import { DIAS_DE_HISTORICO } from "@/lib/historico";
import { cliente, criarAppDeTeste, tokenDe } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

describe("Cache", () => {
  it("/api/cache/publico pode ficar em cache por 60 s", async () => {
    const resposta = await cliente(app).get("/api/cache/publico");
    expect(resposta.status).toBe(200);
    expect(resposta.headers["cache-control"]).toBe("public, max-age=60");
    expect(resposta.body.cotacoes.length).toBeGreaterThan(0);
  });

  it("/api/cache/sem-cache usa no-store", async () => {
    const resposta = await cliente(app).get("/api/cache/sem-cache");
    expect(resposta.headers["cache-control"]).toBe("no-store");
  });

  it("/api/etag responde 304 quando o If-None-Match bate", async () => {
    const primeira = await cliente(app).get("/api/etag");
    const etag = primeira.headers.etag;
    expect(primeira.status).toBe(200);
    expect(etag).toMatch(/^"[0-9a-f]{16}"$/);

    const segunda = await cliente(app).get("/api/etag").set("If-None-Match", etag);
    expect(segunda.status).toBe(304);
    expect(segunda.text).toBe("");
  });

  it("/api/etag muda depois que o preço muda", async () => {
    const antes = (await cliente(app).get("/api/etag")).headers.etag;
    const token = await tokenDe(app);
    await cliente(app).post("/api/ordens").auth(token, { type: "bearer" }).send({ ticker: "INGL3", tipo: "compra", quantidade: 100 });

    const depois = await cliente(app).get("/api/etag").set("If-None-Match", antes);
    expect(depois.status).toBe(200);
    expect(depois.headers.etag).not.toBe(antes);
  });
});

describe("GET /api/seguranca", () => {
  it("sem proxy, mostra conexão http", async () => {
    const resposta = await cliente(app).get("/api/seguranca");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ protocolo: "http", conexaoSegura: false, versaoHttpNaAplicacao: "HTTP/1.1" });
  });

  it("atrás do proxy do Fly.io, lê X-Forwarded-Proto e o IP real", async () => {
    const resposta = await cliente(app)
      .get("/api/seguranca")
      .set("X-Forwarded-Proto", "https")
      .set("X-Forwarded-For", "200.150.10.5")
      .set("Fly-Client-IP", "200.150.10.5");
    expect(resposta.body).toMatchObject({ protocolo: "https", conexaoSegura: true, ipCliente: "200.150.10.5" });
    expect(resposta.body.cabecalhosDoProxy["fly-client-ip"]).toBe("200.150.10.5");
  });
});

describe("GET /api/limite", () => {
  beforeEach(() => app.limitador.limpar());

  it("5 requisições passam e a 6ª recebe 429 com Retry-After", async () => {
    for (let i = 5; i >= 1; i--) {
      const resposta = await cliente(app).get("/api/limite");
      expect(resposta.status).toBe(200);
      expect(resposta.headers["x-ratelimit-remaining"]).toBe(String(i - 1));
    }
    const bloqueada = await cliente(app).get("/api/limite");
    expect(bloqueada.status).toBe(429);
    expect(Number(bloqueada.headers["retry-after"])).toBeGreaterThan(0);
    expect(bloqueada.headers["x-ratelimit-remaining"]).toBe("0");
  });

  it("cada aluno tem o próprio limite pelo cabeçalho X-Aluno", async () => {
    for (let i = 0; i < 5; i++) await cliente(app).get("/api/limite").set("X-Aluno", "ana");
    expect((await cliente(app).get("/api/limite").set("X-Aluno", "ana")).status).toBe(429);
    const outro = await cliente(app).get("/api/limite").set("X-Aluno", "leo");
    expect(outro.status).toBe(200);
    expect(outro.body.identificadoPor).toBe("aluno:leo");
  });

  it("com token, conta por usuário", async () => {
    const token = await tokenDe(app);
    const resposta = await cliente(app).get("/api/limite").auth(token, { type: "bearer" });
    expect(resposta.body.identificadoPor).toBe("usuário:aluno");
  });
});

describe("GET /api/historico", () => {
  it("pagina 365 dias de histórico, do mais recente para o mais antigo", async () => {
    const resposta = await cliente(app).get("/api/historico?ticker=frit3&pagina=2&limite=30");
    expect(resposta.status).toBe(200);
    expect(resposta.body.ticker).toBe("FRIT3");
    expect(resposta.body.dados).toHaveLength(30);
    expect(resposta.body.paginacao).toEqual({ pagina: 2, limite: 30, total: DIAS_DE_HISTORICO, totalPaginas: 13 });
    expect(resposta.body.dados[0].data > resposta.body.dados[1].data).toBe(true);
  });

  it("o fechamento de hoje é o preço atual e o histórico é sempre o mesmo", async () => {
    const a = await cliente(app).get("/api/historico?ticker=DOCE3&limite=5");
    const b = await cliente(app).get("/api/historico?ticker=DOCE3&limite=5");
    expect(a.body.dados[0].fechamento).toBe(3.4);
    expect(a.body.dados).toEqual(b.body.dados);
  });

  it("404 para ticker inexistente e 400 sem ticker", async () => {
    expect((await cliente(app).get("/api/historico?ticker=XXXX3")).status).toBe(404);
    expect((await cliente(app).get("/api/historico")).status).toBe(400);
  });
});
