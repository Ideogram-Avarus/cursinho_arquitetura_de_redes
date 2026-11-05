import type { App } from "@/app";
import { cliente, criarAppDeTeste } from "./ajudantes";

let app: App;
beforeAll(async () => {
  app = await criarAppDeTeste();
});
afterAll(() => app.close());

const PNG_MINIMO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("GET /api/imagens", () => {
  it("metadados listam as imagens com tamanho", async () => {
    const resposta = await cliente(app).get("/api/imagens/metadados");
    expect(resposta.status).toBe(200);
    expect(resposta.body.imagens).toEqual([
      expect.objectContaining({ arquivo: "batata.png", contentType: "image/png", tamanhoBytes: expect.any(Number) }),
      expect.objectContaining({ arquivo: "batata.jpg", contentType: "image/jpeg" }),
    ]);
  });

  it("PNG vem como image/png (resposta binária)", async () => {
    const resposta = await cliente(app).get("/api/imagens/batata.png");
    expect(resposta.status).toBe(200);
    expect(resposta.headers["content-type"]).toBe("image/png");
    expect(Buffer.isBuffer(resposta.body)).toBe(true);
    expect(resposta.body.subarray(1, 4).toString()).toBe("PNG");
  });

  it("JPG vem como image/jpeg", async () => {
    const resposta = await cliente(app).get("/api/imagens/batata.jpg");
    expect(resposta.headers["content-type"]).toBe("image/jpeg");
  });

  it("?download=true manda Content-Disposition: attachment", async () => {
    const resposta = await cliente(app).get("/api/imagens/batata.png?download=true");
    expect(resposta.status).toBe(200);
    expect(resposta.headers["content-disposition"]).toMatch(/^attachment; filename="?batata\.png"?$/);
  });

  it("400 para arquivo fora da lista (não deixa ler outros arquivos)", async () => {
    expect((await cliente(app).get("/api/imagens/..%2F..%2Fpackage.json")).status).toBe(400);
    expect((await cliente(app).get("/api/imagens/outra.gif")).status).toBe(400);
  });
});

describe("POST /api/arquivos", () => {
  it("recebe um arquivo pequeno (201) sem guardar", async () => {
    const resposta = await cliente(app).post("/api/arquivos").attach("arquivo", PNG_MINIMO, "pixel.png");
    expect(resposta.status).toBe(201);
    expect(resposta.body.arquivo).toMatchObject({ nome: "pixel.png", tipo: "image/png", tamanhoBytes: PNG_MINIMO.length });
    expect(resposta.body.arquivo.sha256).toHaveLength(64);
  });

  it("415 para tipo não permitido", async () => {
    const resposta = await cliente(app)
      .post("/api/arquivos")
      .attach("arquivo", Buffer.from("MZ"), { filename: "virus.exe", contentType: "application/x-msdownload" });
    expect(resposta.status).toBe(415);
  });

  it("413 acima de 1 MB", async () => {
    const grande = Buffer.alloc(1024 * 1024 + 10, "a");
    const resposta = await cliente(app).post("/api/arquivos").attach("arquivo", grande, "grande.txt");
    expect(resposta.status).toBe(413);
  });

  it("415 quando não é multipart", async () => {
    const resposta = await cliente(app).post("/api/arquivos").send({ arquivo: "texto" });
    expect(resposta.status).toBe(415);
  });

  it("400 com formulário sem arquivo", async () => {
    const resposta = await cliente(app).post("/api/arquivos").field("nome", "sem arquivo");
    expect(resposta.status).toBe(400);
  });
});
