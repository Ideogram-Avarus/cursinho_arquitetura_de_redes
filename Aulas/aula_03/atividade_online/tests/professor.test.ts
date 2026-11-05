import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cadastrar, criarAppDeTeste, mudarFase, type Http } from "./ajudantes";

let ctx: Awaited<ReturnType<typeof criarAppDeTeste>>;
let http: Http;
beforeEach(async () => {
  ctx = await criarAppDeTeste();
  http = ctx.http;
});
afterEach(() => ctx.app.close());

const responder = (token: string, id: string, corpo: object) =>
  http().put(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);

describe("painel do professor", () => {
  it("o termômetro conta marcações, calcula o acerto e a dificuldade", async () => {
    const ana = await cadastrar(http, "ana", "Ana");
    const bia = await cadastrar(http, "bia", "Bia");
    // A2: Ana acerta tudo (Wi-Fi como LAN também vale); Bia acerta 2 de 5.
    await responder(ana, "A2", { valor: { a: "LAN", b: "WAN", c: "PAN", d: "LAN", e: "MAN" }, marcacao: "S" });
    await responder(bia, "A2", { valor: { a: "WLAN", b: "WAN", c: "LAN", d: "WAN", e: "WAN" }, marcacao: "?" });
    // A10 é aberta: não tem acerto; a dificuldade vem só das marcações.
    await responder(ana, "A10", { valor: { texto: "Não" }, marcacao: "P" });

    const r = await http().get("/api/professor/resumo");
    expect(r.status).toBe(200);
    expect(r.body.alunos).toBe(2);
    const a2 = r.body.questoes.find((q: { questaoId: string }) => q.questaoId === "A2");
    expect(a2).toMatchObject({ respostas: 2, marcacoes: { S: 1, C: 0, P: 0, "?": 1 }, acerto: 0.7 });
    expect(a2.dificuldade).toBeCloseTo((0.5 + 0.3) / 2);
    const a10 = r.body.questoes.find((q: { questaoId: string }) => q.questaoId === "A10");
    expect(a10).toMatchObject({ acerto: null, dificuldade: 1, respostas: 1, corrigidas: 0 });
    expect(a2).toMatchObject({ corrigidas: 2 });
  });

  it("o detalhe mostra as escolhas e esconde os nomes, a não ser que peça", async () => {
    const ana = await cadastrar(http, "ana", "Ana");
    await responder(ana, "A9", { valor: { http: " 80 ", https: "443", mysql: "3307", ip: "o endereço do prédio" } });

    const sem = await http().get("/api/professor/questoes/a9");
    expect(sem.status).toBe(200);
    expect(sem.body.respostas[0].nome).toBeNull();
    const mysql = sem.body.fechadas.find((f: { chave: string }) => f.chave === "mysql");
    expect(mysql).toMatchObject({ contagem: { "3307": 1 }, certas: [], acerto: 0 });
    const porta80 = sem.body.fechadas.find((f: { chave: string }) => f.chave === "http");
    expect(porta80).toMatchObject({ contagem: { "80": 1 }, certas: ["80"], acerto: 1 });

    const com = await http().get("/api/professor/questoes/A9?nomes=true");
    expect(com.body.respostas[0].nome).toBe("Ana");
  });

  it("lista os alunos com o progresso", async () => {
    const ana = await cadastrar(http, "ana", "Ana");
    await responder(ana, "A1", { valor: { texto: "rede" } });
    await responder(ana, "A3", { marcacao: "S" }); // só a marcação: não conta como respondida
    const r = await http().get("/api/professor/alunos");
    expect(r.body).toEqual([
      expect.objectContaining({
        usuario: "ana",
        respondidas: 1,
        total: 27,
        ticket: 0,
        ultimoSalvamento: expect.any(String),
      }),
    ]);
  });

  it("muda a fase da aula (e recusa fase que não existe)", async () => {
    const r = await mudarFase(http, "correcao");
    expect(r.status).toBe(200);
    expect(r.body.fase).toBe("correcao");
    expect((await http().get("/api/estado")).body.fase).toBe("correcao");
    expect((await mudarFase(http, "recreio")).status).toBe(400);
  });

  it("as questões públicas não levam o gabarito", async () => {
    const r = await http().get("/api/questoes");
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(32);
    expect(r.text).not.toContain("3306");
  });
});
