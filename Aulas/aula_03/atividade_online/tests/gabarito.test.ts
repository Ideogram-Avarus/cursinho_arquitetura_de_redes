import { describe, expect, it } from "vitest";
import { confere, corrigir, GABARITO, normalizar } from "../shared/gabarito";
import { chavesDaQuestao, opcoesDaChave, QUESTOES, QUESTOES_POR_ID } from "../shared/questoes";

describe("questões e gabarito", () => {
  it("tem as 27 questões da folha + as 5 do ticket, sem id repetido", () => {
    expect(QUESTOES.filter((q) => q.parte !== "T")).toHaveLength(27);
    expect(QUESTOES.filter((q) => q.parte === "T")).toHaveLength(5);
    expect(new Set(QUESTOES.map((q) => q.id)).size).toBe(QUESTOES.length);
  });

  it("o gabarito só usa chaves e opções que existem nas questões", () => {
    for (const [id, gabarito] of Object.entries(GABARITO)) {
      const q = QUESTOES_POR_ID.get(id);
      expect(q, id).toBeDefined();
      const chaves = chavesDaQuestao(q!);
      for (const [chave, aceitas] of Object.entries(gabarito)) {
        expect(chaves, `${id}.${chave}`).toContain(chave);
        const opcoes = opcoesDaChave(q!, chave);
        if (opcoes) for (const a of aceitas) expect(opcoes, `${id}.${chave}`).toContain(a);
      }
    }
  });

  it("compara sem diferenciar maiúsculas, acentos e espaços", () => {
    expect(normalizar("  Não ")).toBe("nao");
    expect(confere("pan", ["PAN"])).toBe(true);
    expect(confere(" https:// ", [/^https(:\/\/)?$/])).toBe(true);
    expect(confere("?setor = doce & precoMax = 10", [/^\??setor=doce&precomax=10$/])).toBe(true);
    expect(confere("", ["PAN"])).toBe(false);
  });

  it("A7: a ordem da folha é 5-7-2-3-6-1-4", () => {
    const certa = { a: "5", b: "7", c: "2", d: "3", e: "6", f: "1", g: "4" };
    expect(corrigir("A7", certa)).toMatchObject({ certas: 7, total: 7 });
    expect(corrigir("A7", { ...certa, c: "3", d: "2" })).toMatchObject({ certas: 5 });
  });

  it("ticket: aceita a URL com ou sem domínio", () => {
    expect(corrigir("T5", { metodo: "patch", url: "/api/produtos/7" })?.certas).toBe(2);
    expect(corrigir("T5", { metodo: "PATCH", url: "https://loja.com/api/produtos/7" })?.certas).toBe(2);
    expect(corrigir("T5", { metodo: "PUT", url: "/api/produtos/77" })?.certas).toBe(0);
  });

  it("questão aberta não tem correção automática", () => {
    expect(corrigir("A1", { texto: "qualquer coisa" })).toBeNull();
  });
});
