import type { App } from "@/app";
import { BATATAS_OFICIAIS } from "@/lib/seed";
import { cliente, criarAppDeTeste } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

const novaBatata = {
  ticker: "BATA3",
  nome: "Batata da Dupla",
  setor: "gourmet",
  preco: 10.5,
  descricao: "Promissora",
  criadoPor: "Ana e Léo",
};

async function criarBatata(dados: Partial<typeof novaBatata> = {}) {
  const resposta = await cliente(app).post("/api/batatas").send({ ...novaBatata, ...dados });
  expect(resposta.status).toBe(201);
  return resposta.body as { id: number; ticker: string };
}

describe("GET /api/batatas", () => {
  it("lista com paginação padrão (10 por página)", async () => {
    const resposta = await cliente(app).get("/api/batatas");
    expect(resposta.status).toBe(200);
    expect(resposta.body.dados).toHaveLength(10);
    expect(resposta.body.paginacao).toEqual({
      pagina: 1,
      limite: 10,
      total: BATATAS_OFICIAIS.length,
      totalPaginas: 2,
    });
  });

  it("filtra por setor e faixa de preço", async () => {
    const resposta = await cliente(app).get("/api/batatas?setor=processada&precoMin=8&precoMax=15");
    expect(resposta.status).toBe(200);
    const tickers = resposta.body.dados.map((batata: { ticker: string }) => batata.ticker).sort();
    expect(tickers).toEqual(["CHIP4", "PALH3"]);
  });

  it("ordena por preço decrescente", async () => {
    const resposta = await cliente(app).get("/api/batatas?ordenarPor=preco&ordem=desc&limite=1");
    expect(resposta.body.dados[0].ticker).toBe("FRIT3");
  });

  it("busca pelo nome", async () => {
    const resposta = await cliente(app).get("/api/batatas?busca=Doce");
    expect(resposta.body.dados.map((batata: { ticker: string }) => batata.ticker)).toEqual(["DOCE3", "DOCR4"]);
  });

  it("400 quando o setor não existe (com detalhes do campo)", async () => {
    const resposta = await cliente(app).get("/api/batatas?setor=mandioca");
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].campo).toBe("querystring.setor");
  });

  it("400 quando precoMin > precoMax", async () => {
    const resposta = await cliente(app).get("/api/batatas?precoMin=10&precoMax=5");
    expect(resposta.status).toBe(400);
  });

  it("respostas de erro também têm cabeçalho de CORS", async () => {
    const resposta = await cliente(app).get("/api/batatas?limite=0").set("Origin", "https://hoppscotch.io");
    expect(resposta.status).toBe(400);
    expect(resposta.headers["access-control-allow-origin"]).toBe("https://hoppscotch.io");
  });
});

describe("GET /api/batatas/:id", () => {
  it("200 para batata existente (depois do reset, os IDs começam em 1)", async () => {
    const resposta = await cliente(app).get("/api/batatas/1");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: 1, ticker: "INGL3", oficial: true });
  });

  it("404 para batata inexistente", async () => {
    const resposta = await cliente(app).get("/api/batatas/99999");
    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe("Não encontrado");
  });

  it("400 para id que não é número", async () => {
    const resposta = await cliente(app).get("/api/batatas/abc");
    expect(resposta.status).toBe(400);
  });
});

describe("POST /api/batatas", () => {
  it("201 com cabeçalho Location e ticker em maiúsculas", async () => {
    const resposta = await cliente(app).post("/api/batatas").send({ ...novaBatata, ticker: "nova3" });
    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe(`/api/batatas/${resposta.body.id}`);
    expect(resposta.body).toMatchObject({ ticker: "NOVA3", oficial: false, criadoPor: "Ana e Léo" });
  });

  it("409 com ticker repetido", async () => {
    const resposta = await cliente(app).post("/api/batatas").send({ ...novaBatata, ticker: "FRIT3" });
    expect(resposta.status).toBe(409);
  });

  it("400 com campos inválidos", async () => {
    const resposta = await cliente(app).post("/api/batatas").send({ ticker: "X", nome: "B", setor: "gourmet", preco: "caro" });
    expect(resposta.status).toBe(400);
    const campos = resposta.body.detalhes.map((detalhe: { campo: string }) => detalhe.campo);
    expect(campos).toEqual(expect.arrayContaining(["body.ticker", "body.nome", "body.preco"]));
  });

  it("400 com JSON quebrado", async () => {
    const resposta = await cliente(app)
      .post("/api/batatas")
      .set("Content-Type", "application/json")
      .send('{"ticker": "BATA3",');
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe("JSON inválido");
  });
});

describe("PUT, PATCH e DELETE /api/batatas/:id", () => {
  it("PUT substitui tudo (descrição não enviada vira null)", async () => {
    const { id } = await criarBatata({ ticker: "PUTT3" });
    const resposta = await cliente(app)
      .put(`/api/batatas/${id}`)
      .send({ ticker: "PUTT4", nome: "Batata Trocada", setor: "doce", preco: 3 });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ ticker: "PUTT4", nome: "Batata Trocada", setor: "doce", preco: 3, descricao: null });
  });

  it("PUT sem campos obrigatórios responde 400", async () => {
    const { id } = await criarBatata({ ticker: "PUTT5" });
    const resposta = await cliente(app).put(`/api/batatas/${id}`).send({ preco: 3 });
    expect(resposta.status).toBe(400);
  });

  it("PATCH altera só o preço", async () => {
    const { id } = await criarBatata({ ticker: "PTCH3" });
    const resposta = await cliente(app).patch(`/api/batatas/${id}`).send({ preco: 99.9 });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ ticker: "PTCH3", nome: novaBatata.nome, preco: 99.9 });
  });

  it("PATCH com corpo vazio responde 400", async () => {
    const { id } = await criarBatata({ ticker: "PTCH4" });
    const resposta = await cliente(app).patch(`/api/batatas/${id}`).send({});
    expect(resposta.status).toBe(400);
  });

  it("PATCH para um ticker que já existe responde 409", async () => {
    const { id } = await criarBatata({ ticker: "PTCH5" });
    const resposta = await cliente(app).patch(`/api/batatas/${id}`).send({ ticker: "INGL3" });
    expect(resposta.status).toBe(409);
  });

  it("DELETE responde 204 e depois o GET dá 404", async () => {
    const { id } = await criarBatata({ ticker: "APAG3" });
    const apagar = await cliente(app).delete(`/api/batatas/${id}`);
    expect(apagar.status).toBe(204);
    expect(apagar.text).toBe("");
    const depois = await cliente(app).get(`/api/batatas/${id}`);
    expect(depois.status).toBe(404);
  });

  it("batatas oficiais não podem ser alteradas nem apagadas (403)", async () => {
    expect((await cliente(app).patch("/api/batatas/1").send({ preco: 1 })).status).toBe(403);
    expect((await cliente(app).put("/api/batatas/1").send({ ...novaBatata, ticker: "INGL3" })).status).toBe(403);
    expect((await cliente(app).delete("/api/batatas/1")).status).toBe(403);
  });

  it("404 ao alterar batata inexistente", async () => {
    expect((await cliente(app).patch("/api/batatas/99999").send({ preco: 1 })).status).toBe(404);
    expect((await cliente(app).delete("/api/batatas/99999")).status).toBe(404);
  });
});
