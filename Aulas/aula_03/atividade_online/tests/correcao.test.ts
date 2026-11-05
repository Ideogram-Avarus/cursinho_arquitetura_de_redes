import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CorrecaoDaQuestao } from "../shared/esquemas";
import { GABARITO, RESPOSTAS_ESPERADAS, textoDaResposta } from "../shared/gabarito";
import { QUESTOES } from "../shared/questoes";
import { cadastrar, criarAppDeTeste, mudarFase, type Http } from "./ajudantes";

let ctx: Awaited<ReturnType<typeof criarAppDeTeste>>;
let http: Http;
let token: string;
beforeEach(async () => {
  ctx = await criarAppDeTeste();
  http = ctx.http;
  token = await cadastrar(http);
});
afterEach(() => ctx.app.close());

const put = (id: string, corpo: object) =>
  http().put(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);
const patch = (id: string, corpo: object) =>
  http().patch(`/api/eu/respostas/${id}`).set("Authorization", `Bearer ${token}`).send(corpo);
const correcao = () => http().get("/api/eu/correcao").set("Authorization", `Bearer ${token}`);
const daQuestao = async (id: string) =>
  (await correcao()).body.find((c: CorrecaoDaQuestao) => c.questaoId === id) as CorrecaoDaQuestao;

async function avaliar(id: string, avaliacao: string, comentario: string | null) {
  const lista = await http().get(`/api/professor/avaliacoes?questoes=${id}&todas=true`);
  const r = lista.body.questoes[0].respostas[0];
  await http()
    .put("/api/professor/avaliacoes")
    .send({ avaliacoes: [{ usuarioId: r.usuarioId, questaoId: id, versao: r.versao, avaliacao, comentario }] });
}

describe("correção do aluno", () => {
  it("o gabarito só sai do servidor na fase de correção", async () => {
    expect((await correcao()).status).toBe(409);
    await mudarFase(http, "ticket");
    expect((await correcao()).status).toBe(409);
    await mudarFase(http, "encerrada");
    expect((await correcao()).status).toBe(409);
    await mudarFase(http, "correcao");
    expect((await correcao()).status).toBe(200);
    expect((await http().get("/api/eu/correcao")).status).toBe(401);
  });

  it("nunca entrega a resposta do ticket nem a Parte E", async () => {
    await mudarFase(http, "correcao");
    const ids = (await correcao()).body.map((c: CorrecaoDaQuestao) => c.questaoId);
    expect(ids).toContain("A1");
    expect(ids.filter((id: string) => /^[TE]/.test(id))).toEqual([]);
  });

  it("não mostra ao aluno os critérios de avaliação", async () => {
    await mudarFase(http, "correcao");
    const texto = JSON.stringify((await correcao()).body);
    expect(texto).not.toMatch(/Parcial:|Erro comum|Aceite qualquer|Não cobrar/);
  });

  it("toda questão corrigível tem resposta para mostrar, e nenhuma aparece como expressão regular", () => {
    for (const q of QUESTOES.filter((x) => x.corrigivel)) {
      expect(!!GABARITO[q.id] || !!RESPOSTAS_ESPERADAS[q.id], q.id).toBe(true);
      for (const chave of Object.keys(GABARITO[q.id] ?? {})) {
        expect(textoDaResposta(q.id, chave), `${q.id}.${chave}`).toMatch(/^[^^$\\]+$/);
      }
    }
    expect(textoDaResposta("A2", "a")).toBe("WLAN ou LAN");
    expect(textoDaResposta("D1", "query")).toBe("?setor=doce&precoMax=10");
  });

  it("questão fechada certa não aceita correção; errada aceita correção e motivo", async () => {
    await put("A9", { valor: { http: "80", https: "443", mysql: "3306", ip: "o prédio" } });
    await put("C4", { valor: { a: "GET", b: "POST", c: "PATCH", d: "DELETE", e: "PUT" } });
    await put("B3", { valor: { m1: "ACK", m2: "ACK", m3: "ACK" } });
    await mudarFase(http, "correcao");

    expect((await daQuestao("C4")).situacao).toBe("certa");
    const certa = await patch("C4", { correcao: "x" });
    expect(certa.status).toBe(409);
    expect(certa.body.mensagem).toContain("acertou");

    const b3 = await daQuestao("B3");
    expect(b3.situacao).toBe("parcial");
    expect(b3.partes.find((p) => p.chave === "m1")).toEqual({ chave: "m1", certa: false, esperada: "SYN" });

    const r = await patch("B3", { correcao: "SYN, SYN-ACK, ACK", motivoErro: "Confundi a ordem" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ correcao: "SYN, SYN-ACK, ACK", motivoErro: "Confundi a ordem" });
  });

  it("questão em branco conta como errada e pode ser corrigida", async () => {
    await mudarFase(http, "correcao");
    expect((await daQuestao("A10")).situacao).toBe("errada");
    expect((await patch("A10", { correcao: "Não", motivoErro: "Não deu tempo" })).status).toBe(200);
  });

  it("aberta sem avaliação fica pendente: o aluno compara e diz se errou", async () => {
    await put("A10", { valor: { texto: "sim" } });
    await mudarFase(http, "correcao");
    const a10 = await daQuestao("A10");
    expect(a10.situacao).toBe("pendente");
    expect(a10.respostaEsperada).toContain("localhost");
    expect(a10.justificativa).toBeNull();
    expect((await patch("A10", { conferiu: false, motivoErro: "Achei que era o site dele" })).status).toBe(200);
  });

  it("a avaliação da IA define o resultado e a justificativa aparece para o aluno", async () => {
    await put("A10", { valor: { texto: "sim" } });
    await put("A1", { valor: { texto: "dispositivos ligados trocando dados" } });
    await mudarFase(http, "correcao");
    await avaliar("A10", "errada", "O localhost é sempre a sua máquina.");
    await avaliar("A1", "certa", null);

    expect(await daQuestao("A10")).toMatchObject({
      situacao: "errada",
      justificativa: "O localhost é sempre a sua máquina.",
    });
    expect((await daQuestao("A1")).situacao).toBe("certa");
    expect((await patch("A1", { correcao: "x" })).status).toBe(409);
    // Já avaliada: "acertei / errei" não muda mais nada.
    expect((await patch("A10", { conferiu: true })).status).toBe(400);
    expect((await patch("A10", { correcao: "Não" })).status).toBe(200);
  });

  it("fechada toda certa com a parte escrita em branco fica parcial", async () => {
    await put("A9", { valor: { http: "80", https: "443", mysql: "3306" } });
    await mudarFase(http, "correcao");
    expect(await daQuestao("A9")).toMatchObject({ situacao: "parcial", abertaEmBranco: true });
  });

  it("o professor vê o motivo no detalhe e no CSV, e o JSON ida e volta mantém", async () => {
    await put("B3", { valor: { m1: "ACK", m2: "SYN-ACK", m3: "ACK" } });
    await mudarFase(http, "correcao");
    await patch("B3", { motivoErro: "Confundi a ordem" });

    const detalhe = await http().get("/api/professor/questoes/B3");
    expect(detalhe.body.respostas[0].motivoErro).toBe("Confundi a ordem");
    const csv = await http().get("/api/professor/exportar?formato=csv");
    expect(csv.text).toContain("Confundi a ordem");

    const json = JSON.parse((await http().get("/api/professor/exportar?formato=json")).text);
    expect(json.usuarios[0].respostas[0].motivoErro).toBe("Confundi a ordem");
    delete json.usuarios[0].respostas[0].motivoErro; // export antigo, de antes deste campo
    expect((await http().post("/api/professor/importar").send(json)).status).toBe(200);
  });
});
