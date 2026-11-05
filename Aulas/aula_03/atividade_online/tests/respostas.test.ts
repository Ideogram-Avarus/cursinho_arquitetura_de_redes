import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cadastrar, criarAppDeTeste, mudarFase, type Http } from "./ajudantes";

let ctx: Awaited<ReturnType<typeof criarAppDeTeste>>;
let http: Http;
let token: string;
const put = (id: string, corpo: object) =>
  http().put(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);
const patch = (id: string, corpo: object) =>
  http().patch(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);

beforeEach(async () => {
  ctx = await criarAppDeTeste();
  http = ctx.http;
  token = await cadastrar(http);
});
afterEach(() => ctx.app.close());

describe("respostas do aluno", () => {
  it("salva com PUT e devolve tudo em GET /api/eu", async () => {
    const r = await put("A2", { valor: { a: "WLAN", b: "WAN" }, marcacao: "C" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ questaoId: "A2", valor: { a: "WLAN", b: "WAN" }, marcacao: "C" });

    // Só a marcação: a resposta continua lá.
    await put("A2", { marcacao: "S" });
    const eu = await http().get("/api/eu").set("Authorization", `Bearer ${token}`);
    expect(eu.body.respostas).toEqual([expect.objectContaining({ valor: { a: "WLAN", b: "WAN" }, marcacao: "S" })]);
  });

  it("PUT é idempotente: mandar duas vezes dá no mesmo", async () => {
    await put("A1", { valor: { texto: "dois PCs ligados" } });
    await put("A1", { valor: { texto: "dois PCs ligados" } });
    const eu = await http().get("/api/eu").set("Authorization", `Bearer ${token}`);
    expect(eu.body.respostas).toHaveLength(1);
  });

  it("recusa campo que a questão não tem e opção que não existe (400)", async () => {
    const campo = await put("A2", { valor: { z: "WAN" } });
    expect(campo.status).toBe(400);
    expect(campo.body.mensagem).toContain('"z"');
    expect((await put("A2", { valor: { a: "Wi-Fi" } })).status).toBe(400);
    expect((await put("A7", { valor: { a: "9" } })).status).toBe(400);
  });

  it("a Parte E não tem marcação (400) e questão inexistente dá 404", async () => {
    expect((await put("E1", { marcacao: "S" })).status).toBe(400);
    expect((await put("Z9", { valor: {} })).status).toBe(404);
  });

  it("o ticket só abre na fase ticket; a atividade trava fora da fase atividade (409)", async () => {
    expect((await put("T1", { valor: { rede: "PAN" } })).status).toBe(409);
    await mudarFase(http, "ticket");
    expect((await put("T1", { valor: { rede: "PAN" } })).status).toBe(200);
    const travada = await put("A1", { valor: { texto: "mudei" } });
    expect(travada.status).toBe(409);
    expect(travada.body.erro).toBe("Fase errada");
  });

  it("a correção (PATCH) só vale na fase correção e não mexe na resposta", async () => {
    await put("A10", { valor: { texto: "sim" }, marcacao: "?" });
    expect((await patch("A10", { conferiu: false })).status).toBe(409);

    await mudarFase(http, "correcao");
    const r = await patch("A10", { conferiu: false, correcao: "Não: localhost é o MEU computador." });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({
      valor: { texto: "sim" },
      marcacao: "?",
      conferiu: false,
      correcao: "Não: localhost é o MEU computador.",
    });
    expect((await patch("E1", { conferiu: true })).status).toBe(400); // a Parte E não tem correção
  });

  it("depois de reimportar outro banco, o token de um usuário que não existe mais não vale (401)", async () => {
    const exp = await http().get("/api/professor/exportar?formato=json");
    const dados = JSON.parse(exp.text);
    dados.usuarios[0].usuario = "outro";
    expect((await http().post("/api/professor/importar").send(dados)).status).toBe(200);
    expect((await http().get("/api/eu").set("Authorization", `Bearer ${token}`)).status).toBe(401);
  });
});
