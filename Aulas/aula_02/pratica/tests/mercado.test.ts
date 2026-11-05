import type { App } from "@/app";
import { precoAposOrdem } from "@/lib/mercado";
import { cliente, criarAppDeTeste, tokenDe } from "./ajudantes";

let app: App;
let token: string;
beforeEach(async () => {
  app = await criarAppDeTeste();
  token = await tokenDe(app);
});
afterEach(() => app.close());

const ordem = (corpo: object) => cliente(app).post("/api/ordens").auth(token, { type: "bearer" }).send(corpo);

describe("POST /api/ordens", () => {
  it("compra: debita o saldo, cria a posição e sobe o preço", async () => {
    const resposta = await ordem({ ticker: "frit3", tipo: "compra", quantidade: 10 });
    expect(resposta.status).toBe(201);
    expect(resposta.body.ordem).toMatchObject({ tipo: "COMPRA", ticker: "FRIT3", quantidade: 10, precoUnitario: 22.1, total: 221 });
    expect(resposta.body.saldoAtual).toBe(9779);
    expect(resposta.body.novoPreco).toBe(precoAposOrdem(22.1, "COMPRA", 10));

    const carteira = await cliente(app).get("/api/carteira").auth(token, { type: "bearer" });
    expect(carteira.body.posicoes).toEqual([
      expect.objectContaining({ ticker: "FRIT3", quantidade: 10, precoAtual: resposta.body.novoPreco }),
    ]);
  });

  it("venda: credita o saldo e remove a posição zerada", async () => {
    await ordem({ ticker: "INGL3", tipo: "compra", quantidade: 5 });
    const resposta = await ordem({ ticker: "INGL3", tipo: "venda", quantidade: 5 });
    expect(resposta.status).toBe(201);
    const carteira = await cliente(app).get("/api/carteira").auth(token, { type: "bearer" });
    expect(carteira.body.posicoes).toEqual([]);
  });

  it("409 sem saldo suficiente", async () => {
    const resposta = await ordem({ ticker: "FRIT3", tipo: "compra", quantidade: 10_000 });
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toBe("Saldo insuficiente");
  });

  it("409 ao vender ações que não tem", async () => {
    const resposta = await ordem({ ticker: "FRIT3", tipo: "venda", quantidade: 1 });
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toBe("Ações insuficientes");
  });

  it("404 com ticker inexistente", async () => {
    expect((await ordem({ ticker: "XXXX3", tipo: "compra", quantidade: 1 })).status).toBe(404);
  });

  it("400 com tipo ou quantidade inválidos", async () => {
    const resposta = await ordem({ ticker: "FRIT3", tipo: "aluguel", quantidade: 0 });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes).toHaveLength(2);
  });

  it("401 sem token", async () => {
    expect((await cliente(app).post("/api/ordens").send({ ticker: "FRIT3", tipo: "compra", quantidade: 1 })).status).toBe(401);
  });
});

describe("GET /api/carteira e /api/ordens", () => {
  it("carteira começa com R$ 10.000 e sem ações", async () => {
    const resposta = await cliente(app).get("/api/carteira").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ usuario: "aluno", saldo: 10000, valorEmAcoes: 0, patrimonioTotal: 10000, posicoes: [] });
  });

  it("lista as ordens da mais nova para a mais antiga", async () => {
    await ordem({ ticker: "DOCE3", tipo: "compra", quantidade: 2 });
    await ordem({ ticker: "DOCE3", tipo: "venda", quantidade: 1 });
    const resposta = await cliente(app).get("/api/ordens").auth(token, { type: "bearer" });
    expect(resposta.status).toBe(200);
    expect(resposta.body.ordens.map((item: { tipo: string }) => item.tipo)).toEqual(["VENDA", "COMPRA"]);
  });

  it("401 sem token", async () => {
    expect((await cliente(app).get("/api/carteira")).status).toBe(401);
    expect((await cliente(app).get("/api/ordens")).status).toBe(401);
  });
});

describe("GET /api/ranking", () => {
  it("ordena investidores pelo patrimônio e não mostra o professor", async () => {
    await cliente(app).post("/api/auth/registro").send({ usuario: "rival", senha: "123456" });
    await ordem({ ticker: "FRIT3", tipo: "compra", quantidade: 100 }); // o preço sobe: o aluno fica mais rico

    const resposta = await cliente(app).get("/api/ranking");
    expect(resposta.status).toBe(200);
    expect(resposta.body.ranking.map((item: { usuario: string }) => item.usuario)).toEqual(["aluno", "rival"]);
    expect(resposta.body.ranking[0].posicao).toBe(1);
  });
});

describe("precoAposOrdem", () => {
  it("sobe 0,1% por ação comprada e desce na venda, com limite de 20%", () => {
    expect(precoAposOrdem(10, "COMPRA", 10)).toBe(10.1);
    expect(precoAposOrdem(10, "VENDA", 10)).toBe(9.9);
    expect(precoAposOrdem(10, "COMPRA", 5000)).toBe(12);
    expect(precoAposOrdem(0.01, "VENDA", 5000)).toBe(0.01);
  });
});
