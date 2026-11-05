import { describe, expect, it } from "vitest";
import type { ResumoQuestao } from "../shared/esquemas";
import { barraDaQuestao, questoesDoConjunto, totais } from "../web/lib/grafico";

const questao = (questaoId: string, campos: Partial<ResumoQuestao>): ResumoQuestao => ({
  questaoId,
  respostas: 0,
  marcacoes: { S: 0, C: 0, P: 0, "?": 0 },
  acerto: null,
  corrigidas: 0,
  conferiram: 0,
  corrigiram: 0,
  avaliadas: 0,
  paraAvaliar: 0,
  dificuldade: 0,
  ...campos,
});

describe("gráfico ao vivo", () => {
  it("separa acerto, erro e o que ainda não tem nota", () => {
    const barra = barraDaQuestao(questao("A2", { respostas: 10, corrigidas: 8, acerto: 0.75 }));
    expect(barra).toEqual({ acertos: 6, erros: 2, aguardando: 2 });
  });

  it("aberta sem avaliação fica toda em aguardando, e não conta como erro", () => {
    const barra = barraDaQuestao(questao("A10", { respostas: 4 }));
    expect(barra).toEqual({ acertos: 0, erros: 0, aguardando: 4 });
  });

  it("o acerto geral pesa pelas respostas com nota, não pela média das questões", () => {
    const soma = totais([
      questao("A1", { respostas: 9, corrigidas: 9, acerto: 1 }),
      questao("A2", { respostas: 1, corrigidas: 1, acerto: 0 }),
      questao("A10", { respostas: 5 }),
    ]);
    expect(soma.acerto).toBeCloseTo(0.9);
    expect(soma.respostas).toBe(15);
    expect(soma.aguardando).toBe(5);
  });

  it("sem nenhuma nota, o acerto geral é null (e não 0%)", () => {
    expect(totais([questao("A10", { respostas: 3 })]).acerto).toBeNull();
    expect(totais([]).acerto).toBeNull();
  });

  it("separa atividade e ticket, e deixa a Parte E de fora", () => {
    const todas = ["A1", "D1", "E1", "T1"].map((id) => questao(id, {}));
    expect(questoesDoConjunto(todas, "atividade").map((q) => q.questaoId)).toEqual(["A1", "D1"]);
    expect(questoesDoConjunto(todas, "ticket").map((q) => q.questaoId)).toEqual(["T1"]);
  });
});
