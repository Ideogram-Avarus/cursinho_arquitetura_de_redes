/** Erro com código HTTP: o plugin de erros transforma em { status, erro, mensagem, dica }. */
export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    public readonly erro: string,
    mensagem: string,
    public readonly dica?: string,
  ) {
    super(mensagem);
  }
}

export const naoEncontrado = (mensagem: string) => new ErroHttp(404, "Não encontrado", mensagem);
export const requisicaoInvalida = (mensagem: string, dica?: string) =>
  new ErroHttp(400, "Requisição inválida", mensagem, dica);
