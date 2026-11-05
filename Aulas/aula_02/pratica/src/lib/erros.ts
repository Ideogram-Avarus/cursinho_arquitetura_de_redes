/**
 * Erro HTTP com mensagem em português.
 * Lance de dentro de uma rota e o handler de erros (plugins/erros.ts) monta a resposta.
 */
export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    public readonly erro: string,
    mensagem: string,
    public readonly dica?: string,
    public readonly cabecalhos: Record<string, string> = {},
  ) {
    super(mensagem);
    this.name = "ErroHttp";
  }
}

export const requisicaoInvalida = (mensagem: string, dica?: string) =>
  new ErroHttp(400, "Requisição inválida", mensagem, dica);

export const naoAutenticado = (mensagem: string, dica?: string) =>
  new ErroHttp(401, "Não autenticado", mensagem, dica, { "WWW-Authenticate": "Bearer" });

export const proibido = (mensagem: string, dica?: string) => new ErroHttp(403, "Proibido", mensagem, dica);

export const naoEncontrado = (mensagem: string, dica?: string) =>
  new ErroHttp(404, "Não encontrado", mensagem, dica);

export const conflito = (mensagem: string, dica?: string) => new ErroHttp(409, "Conflito", mensagem, dica);
