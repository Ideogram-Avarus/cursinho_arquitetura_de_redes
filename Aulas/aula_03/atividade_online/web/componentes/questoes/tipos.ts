import type { Questao, Valor } from "../../../shared/questoes";

export interface PropsResposta<Q extends Questao = Questao> {
  q: Q;
  valor: Valor;
  /** Recebe a resposta inteira, já com a mudança. */
  aoMudar: (valor: Valor) => void;
  /** Ao sair de um campo de texto: salva na hora. */
  aoSair: () => void;
  travada: boolean;
}

/** Copia a resposta trocando (ou apagando, se vazio) uma chave. */
export function comChave(valor: Valor, chave: string, texto: string | undefined): Valor {
  const novo = { ...valor };
  if (texto === undefined || texto === "") delete novo[chave];
  else novo[chave] = texto;
  return novo;
}
