import { afterEach, describe, expect, it } from "vitest";
import { cadastrar, criarAppDeTeste, mudarFase } from "./ajudantes";

const apps: Awaited<ReturnType<typeof criarAppDeTeste>>[] = [];
const novoApp = async () => {
  const ctx = await criarAppDeTeste();
  apps.push(ctx);
  return ctx;
};
afterEach(async () => {
  await Promise.all(apps.splice(0).map((c) => c.app.close()));
});

async function popular() {
  const ctx = await novoApp();
  const ana = await cadastrar(ctx.http, "ana", "Ana");
  const bia = await cadastrar(ctx.http, "bia", 'Bia; a "Bi"');
  await ctx
    .http()
    .put("/api/eu/respostas/A1")
    .set("Authorization", `Bearer ${ana}`)
    .send({ valor: { texto: "=SOMA(1;2)" }, marcacao: "S" });
  await ctx
    .http()
    .put("/api/eu/respostas/A2")
    .set("Authorization", `Bearer ${bia}`)
    .send({ valor: { a: "WLAN" }, marcacao: "C" });
  await mudarFase(ctx.http, "correcao");
  await ctx.http().patch("/api/eu/respostas/A1").set("Authorization", `Bearer ${ana}`).send({ conferiu: true });
  return { ...ctx, ana };
}

const semCarimbo = (texto: string) => ({ ...JSON.parse(texto), exportadoEm: "x" });

describe("exportar e importar", () => {
  it("exporta → apaga (máquina nova) → importa → igual, e o token continua valendo", async () => {
    const origem = await popular();
    const exp = await origem.http().get("/api/professor/exportar?formato=json");
    expect(exp.status).toBe(200);
    expect(exp.headers["content-disposition"]).toMatch(/^attachment; filename="atividade-aula03_.+\.json"$/);

    const destino = await novoApp(); // como se a máquina do Fly tivesse reiniciado
    const imp = await destino.http().post("/api/professor/importar").send(JSON.parse(exp.text));
    expect(imp.status).toBe(200);
    expect(imp.body).toEqual({ usuarios: 2, respostas: 2, fase: "correcao" });

    const exp2 = await destino.http().get("/api/professor/exportar?formato=json");
    expect(semCarimbo(exp2.text)).toEqual(semCarimbo(exp.text));

    // O aluno não precisa entrar de novo: o id e o usuário são os mesmos.
    const eu = await destino.http().get("/api/eu").set("Authorization", `Bearer ${origem.ana}`);
    expect(eu.status).toBe(200);
    expect(eu.body.respostas[0]).toMatchObject({ questaoId: "A1", conferiu: true });
    // E dá para criar conta nova depois (o autoincremento continua do maior id).
    const nova = await destino.http().post("/api/auth/cadastro").send({ usuario: "caio", senha: "1234", nome: "Caio" });
    expect(nova.status).toBe(201);
  });

  it("o export marca a hora do último export", async () => {
    const ctx = await novoApp();
    expect((await ctx.http().get("/api/estado")).body.ultimoExport).toBeNull();
    await ctx.http().get("/api/professor/exportar?formato=csv");
    expect((await ctx.http().get("/api/estado")).body.ultimoExport).toEqual(expect.any(String));
  });

  it("JSON fora do formato dá 400 e não mexe no banco", async () => {
    const ctx = await popular();
    const exp = JSON.parse((await ctx.http().get("/api/professor/exportar?formato=json")).text);
    const [u0, u1] = exp.usuarios;

    const ruins = [
      { formato: "outro" },
      { ...exp, usuarios: [{ ...u0, respostas: [{ ...u0.respostas[0], questaoId: "Z1" }] }] },
      { ...exp, usuarios: [u0, u0] },
      { ...exp, usuarios: [{ ...u1, respostas: [{ ...u1.respostas[0], valor: { a: "Wi-Fi" } }] }] },
    ];
    for (const ruim of ruins) {
      expect((await ctx.http().post("/api/professor/importar").send(ruim)).status).toBe(400);
    }
    expect((await ctx.http().get("/api/professor/alunos")).body).toHaveLength(2);
  });

  it("o CSV abre no Excel: BOM, ponto e vírgula, aspas e fórmula neutralizada", async () => {
    const ctx = await popular();
    const r = await ctx.http().get("/api/professor/exportar?formato=csv");
    expect(r.headers["content-type"]).toContain("text/csv");
    const linhas = r.text.split("\r\n");
    expect(linhas[0]).toBe(
      "﻿usuário;nome;questão;resposta;marcação;acertou;correção;por que errou;conferiu;avaliação;comentário da avaliação;atualizado_em",
    );
    expect(r.text).toContain(`ana;Ana;A1;"'=SOMA(1;2)";S;;;;sim;`);
    expect(r.text).toContain(`bia;"Bia; a ""Bi""";A2;a) O Wi-Fi da sua casa: WLAN;C;1/5;;;;`);
  });
});
