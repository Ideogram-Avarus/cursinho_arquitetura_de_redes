import type { Resposta } from "../../shared/esquemas.js";
import { chavesDaQuestao, opcoesDaChave, type Questao, type Valor } from "../../shared/questoes.js";
import type { Resposta as RespostaDoBanco } from "../generated/prisma/client.js";
import { requisicaoInvalida } from "./erros.js";

export function lerValor(json: string): Valor {
  try {
    const valor = JSON.parse(json) as unknown;
    return valor && typeof valor === "object" ? (valor as Valor) : {};
  } catch {
    return {};
  }
}

export function paraJson(r: RespostaDoBanco): Resposta {
  return {
    questaoId: r.questaoId,
    valor: lerValor(r.valor),
    marcacao: (r.marcacao as Resposta["marcacao"]) ?? null,
    correcao: r.correcao,
    motivoErro: r.motivoErro,
    conferiu: r.conferiu,
    atualizadoEm: r.atualizadoEm.toISOString(),
  };
}

/** Confere se a resposta só tem chaves da questão e se as escolhas estão entre as opções. */
export function validarValor(q: Questao, valor: Valor): Valor {
  const permitidas = new Set(chavesDaQuestao(q));
  const limpo: Valor = {};
  for (const [chave, texto] of Object.entries(valor)) {
    if (!permitidas.has(chave)) {
      throw requisicaoInvalida(
        `A questão ${q.id} não tem o campo "${chave}".`,
        `Campos aceitos: ${[...permitidas].join(", ")}`,
      );
    }
    const opcoes = opcoesDaChave(q, chave);
    if (opcoes && texto !== "" && !opcoes.includes(texto)) {
      throw requisicaoInvalida(
        `"${texto}" não é uma opção do campo "${chave}" da questão ${q.id}.`,
        `Opções: ${opcoes.join(", ")}`,
      );
    }
    if (texto !== "") limpo[chave] = texto;
  }
  return limpo;
}
