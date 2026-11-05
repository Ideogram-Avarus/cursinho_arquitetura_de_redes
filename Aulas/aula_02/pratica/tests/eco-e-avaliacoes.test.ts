import type { App } from "@/app";
import { cliente, criarAppDeTeste } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

describe("POST /api/eco", () => {
  it("devolve o JSON recebido", async () => {
    const corpo = { nome: "Maria", idade: 16, curso: "DS" };
    const resposta = await cliente(app).post("/api/eco").send(corpo);
    expect(resposta.status).toBe(200);
    expect(resposta.body.recebido).toEqual(corpo);
    expect(resposta.body.contentType).toMatch(/application\/json/);
    expect(resposta.body.tamanhoBytes).toBe(JSON.stringify(corpo).length);
  });

  it("400 com JSON inválido", async () => {
    const resposta = await cliente(app).post("/api/eco").set("Content-Type", "application/json").send("{nome: Maria}");
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe("JSON inválido");
  });

  it("400 com corpo vazio e Content-Type JSON", async () => {
    const resposta = await cliente(app).post("/api/eco").set("Content-Type", "application/json");
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe("Corpo vazio");
  });

  it("415 com Content-Type text/plain", async () => {
    const resposta = await cliente(app).post("/api/eco").set("Content-Type", "text/plain").send("oi");
    expect(resposta.status).toBe(415);
  });

  it("400 quando o JSON não é um objeto", async () => {
    const resposta = await cliente(app).post("/api/eco").set("Content-Type", "application/json").send("[1, 2, 3]");
    expect(resposta.status).toBe(400);
  });

  it("413 com corpo maior que 100 KB", async () => {
    const resposta = await cliente(app).post("/api/eco").send({ texto: "x".repeat(110 * 1024) });
    expect(resposta.status).toBe(413);
  });
});

describe("/api/avaliacoes", () => {
  it("POST cria a avaliação (201)", async () => {
    const resposta = await cliente(app).post("/api/avaliacoes").send({ apelido: "Batateiro", nota: 5, comentario: "Top" });
    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ apelido: "Batateiro", nota: 5, comentario: "Top" });
  });

  it("POST com nota fora de 1 a 5 responde 400", async () => {
    const resposta = await cliente(app).post("/api/avaliacoes").send({ apelido: "Batateiro", nota: 7 });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].campo).toBe("body.nota");
  });

  it("GET lista e calcula a média", async () => {
    await cliente(app).post("/api/avaliacoes").send({ apelido: "Outro", nota: 4 });
    const resposta = await cliente(app).get("/api/avaliacoes");
    expect(resposta.status).toBe(200);
    expect(resposta.body.total).toBe(2);
    expect(resposta.body.media).toBe(4.5);
    expect(resposta.body.avaliacoes[0].apelido).toBe("Outro");
  });
});
