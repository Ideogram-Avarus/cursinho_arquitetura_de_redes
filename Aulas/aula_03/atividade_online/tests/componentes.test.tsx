// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QUESTOES_POR_ID, type QuestaoOrdenar, type QuestaoVF } from "../shared/questoes";
import { RespostaVF } from "../web/componentes/questoes/RespostaClassificar";
import { RespostaOrdenar } from "../web/componentes/questoes/RespostaOrdenar";

afterEach(cleanup);

describe("RespostaOrdenar (A7)", () => {
  const q = QUESTOES_POR_ID.get("A7") as QuestaoOrdenar;

  it("começa na ordem da folha e, ao descer o 1º item, grava todas as posições", () => {
    const aoMudar = vi.fn();
    render(<RespostaOrdenar q={q} valor={{}} aoMudar={aoMudar} aoSair={() => {}} travada={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Descer: O pedido viaja pelo backbone/ }));
    expect(aoMudar).toHaveBeenCalledWith({ b: "1", a: "2", c: "3", d: "4", e: "5", f: "6", g: "7" });
  });

  it("mostra a ordem salva", () => {
    const valor = { a: "5", b: "7", c: "2", d: "3", e: "6", f: "1", g: "4" };
    render(<RespostaOrdenar q={q} valor={valor} aoMudar={() => {}} aoSair={() => {}} travada />);
    const itens = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(itens[0]).toContain("Eu digito a URL");
    expect(itens[6]).toContain("O navegador monta e mostra a página");
    expect(screen.queryByText("Confirmar esta ordem")).toBeNull();
  });
});

describe("RespostaVF (B4)", () => {
  const q = QUESTOES_POR_ID.get("B4") as QuestaoVF;

  it('o campo "corrija" só aparece no F, e trocar para V apaga a correção', () => {
    const aoMudar = vi.fn();
    const props = { q, aoMudar, aoSair: () => {}, travada: false };
    const { rerender } = render(<RespostaVF {...props} valor={{}} />);
    expect(screen.queryByLabelText("Corrija a frase")).toBeNull();

    rerender(<RespostaVF {...props} valor={{ a: "F", "a.correcao": "x" }} />);
    expect(screen.getByLabelText("Corrija a frase")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("radio", { name: "V" })[0]!);
    expect(aoMudar).toHaveBeenCalledWith({ a: "V" });
  });
});
