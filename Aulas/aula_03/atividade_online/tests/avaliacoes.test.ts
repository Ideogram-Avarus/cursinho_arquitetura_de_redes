import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cadastrar, criarAppDeTeste, type Http } from "./ajudantes";

let ctx: Awaited<ReturnType<typeof criarAppDeTeste>>;
let http: Http;
let ana: string;
let bia: string;
beforeEach(async () => {
  ctx = await criarAppDeTeste();
  http = ctx.http;
  ana = await cadastrar(http, "ana", "Ana");
  bia = await cadastrar(http, "bia", "Bia");
});
afterEach(() => ctx.app.close());

const responder = (token: string, id: string, corpo: object) =>
  http().put(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);
const pendentes = (consulta = "") => http().get(`/api/professor/avaliacoes${consulta}`);
const avaliar = (avaliacoes: object[]) => http().put("/api/professor/avaliacoes").send({ avaliacoes });
const resumoDe = async (id: string) =>
  (await http().get("/api/professor/resumo")).body.questoes.find((q: { questaoId: string }) => q.questaoId === id);

describe("avaliação das partes abertas", () => {
  it("lista só as respostas com parte aberta, com a referência e sem o nome do aluno", async () => {
    await responder(ana, "A10", { valor: { texto: "Não, localhost é o meu PC" } });
    await responder(ana, "A2", { valor: { a: "WLAN" } }); // só fechada: não entra
    await responder(ana, "E1", { valor: { texto: "HTTP" } }); // Parte E: não tem resposta certa
    await responder(bia, "B2", { valor: { a: "UDP", "a.porque": "é mais rápido" } });

    const r = await pendentes();
    expect(r.status).toBe(200);
    expect(r.body.total).toBe(2);
    expect(r.body.questoes.map((q: { questaoId: string }) => q.questaoId)).toEqual(["A10", "B2"]);
    const a10 = r.body.questoes[0];
    expect(a10.referencia).toContain("localhost");
    expect(a10.respostas[0]).toMatchObject({
      usuarioId: expect.any(Number),
      versao: expect.any(String),
      campos: [{ rotulo: "Resposta", texto: "Não, localhost é o meu PC", aberta: true }],
      avaliacao: null,
    });
    expect(JSON.stringify(r.body)).not.toContain("Ana");
    // B2: a escolha (fechada) vem junto, para dar contexto à justificativa (aberta).
    expect(r.body.questoes[1].respostas[0].campos).toEqual([
      { rotulo: "Chamada de vídeo ao vivo", texto: "UDP", aberta: false },
      { rotulo: "Chamada de vídeo ao vivo — por quê?", texto: "é mais rápido", aberta: true },
    ]);
    expect((await pendentes("?questoes=b2")).body.total).toBe(1);
  });

  it("grava em lote, some das pendentes e entra no acerto do termômetro", async () => {
    await responder(ana, "A10", { valor: { texto: "Não" } });
    await responder(bia, "A10", { valor: { texto: "Sim" } });
    await responder(bia, "B2", { valor: { a: "UDP", "a.porque": "é mais rápido" } });
    const lista = (await pendentes()).body;
    const [a10, b2] = lista.questoes;

    const r = await avaliar([
      { ...a10.respostas[0], questaoId: "A10", avaliacao: "certa" },
      {
        ...a10.respostas[1],
        questaoId: "A10",
        avaliacao: "errada",
        comentario: "Achou que localhost é o PC do colega.",
      },
      { ...b2.respostas[0], questaoId: "B2", avaliacao: "parcial", comentario: "Só falou em velocidade." },
    ]);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ salvas: 3, ignoradas: [] });

    expect((await pendentes()).body.total).toBe(0);
    expect((await pendentes("?todas=true")).body.total).toBe(3);

    expect(await resumoDe("A10")).toMatchObject({ acerto: 0.5, avaliadas: 2, paraAvaliar: 0 });
    // B2: a parte fechada (1 de 5 certa = 0,2) e a aberta (parcial = 0,5) valem metade cada.
    expect((await resumoDe("B2")).acerto).toBeCloseTo((0.2 + 0.5) / 2);

    const detalhe = await http().get("/api/professor/questoes/A10");
    expect(detalhe.body.respostas.map((x: { avaliacao: string }) => x.avaliacao).sort()).toEqual(["certa", "errada"]);
  });

  it("se o aluno muda a resposta, a avaliação deixa de valer e a gravação atrasada é ignorada", async () => {
    await responder(ana, "A10", { valor: { texto: "Sim" } });
    const lida = (await pendentes()).body.questoes[0].respostas[0];
    await avaliar([{ ...lida, questaoId: "A10", avaliacao: "errada" }]);

    // O aluno corrige a resposta: volta a ficar pendente, e o acerto antigo some.
    await responder(ana, "A10", { valor: { texto: "Não, é o meu computador" } });
    expect((await pendentes()).body.total).toBe(1);
    expect(await resumoDe("A10")).toMatchObject({ acerto: null, avaliadas: 0, paraAvaliar: 1 });

    // Gravar usando a versão antiga (lida antes da mudança) não vale.
    const r = await avaliar([{ ...lida, questaoId: "A10", avaliacao: "certa" }]);
    expect(r.body.salvas).toBe(0);
    expect(r.body.ignoradas[0].motivo).toContain("mudou a resposta");

    // Só marcar S C P ? não muda a resposta: a avaliação continua valendo.
    const nova = (await pendentes()).body.questoes[0].respostas[0];
    await avaliar([{ ...nova, questaoId: "A10", avaliacao: "certa" }]);
    await responder(ana, "A10", { marcacao: "C" });
    expect((await pendentes()).body.total).toBe(0);
  });

  it("recusa questão sem parte aberta, apaga com null e valida o corpo (400)", async () => {
    await responder(ana, "A10", { valor: { texto: "Não" } });
    const lida = (await pendentes()).body.questoes[0].respostas[0];

    const semAberta = await avaliar([{ ...lida, questaoId: "A2", avaliacao: "certa" }]);
    expect(semAberta.body.ignoradas[0].motivo).toContain("não tem parte aberta");
    expect((await avaliar([{ ...lida, questaoId: "A10", avaliacao: "ótima" }])).status).toBe(400);
    expect((await avaliar([])).status).toBe(400);

    await avaliar([{ ...lida, questaoId: "A10", avaliacao: "certa" }]);
    await avaliar([{ ...lida, questaoId: "A10", avaliacao: null }]);
    expect((await pendentes()).body.total).toBe(1);
  });

  it("as avaliações vão no export JSON e no CSV, e voltam no import", async () => {
    await responder(ana, "A10", { valor: { texto: "Não" } });
    const lida = (await pendentes()).body.questoes[0].respostas[0];
    await avaliar([{ ...lida, questaoId: "A10", avaliacao: "certa", comentario: "Boa; direto ao ponto." }]);

    const exp = JSON.parse((await http().get("/api/professor/exportar?formato=json")).text);
    expect(exp.usuarios[0].avaliacoes).toEqual([expect.objectContaining({ questaoId: "A10", avaliacao: "certa" })]);

    const destino = await criarAppDeTeste();
    try {
      expect((await destino.http().post("/api/professor/importar").send(exp)).status).toBe(200);
      const depois = await destino.http().get("/api/professor/avaliacoes?todas=true");
      expect(depois.body.questoes[0].respostas[0]).toMatchObject({
        avaliacao: "certa",
        comentario: "Boa; direto ao ponto.",
      });
      const csv = (await destino.http().get("/api/professor/exportar?formato=csv")).text;
      expect(csv).toContain(`ana;Ana;A10;Não;;;;;;certa;"Boa; direto ao ponto.";`);

      // Export antigo, sem o campo "avaliacoes", continua importando.
      const antigo = { ...exp, usuarios: exp.usuarios.map(({ avaliacoes: _a, ...u }: { avaliacoes: unknown }) => u) };
      expect((await destino.http().post("/api/professor/importar").send(antigo)).status).toBe(200);
    } finally {
      await destino.app.close();
    }
  });
});
