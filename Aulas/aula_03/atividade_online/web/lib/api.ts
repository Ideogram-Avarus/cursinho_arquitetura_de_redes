// Conversa com a API (mesma origem: /api). Guarda o token do aluno no localStorage.

const CHAVE_TOKEN = "atividade-aula03:token";

export const armazenamento = {
  ler(chave: string): string | null {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  },
  gravar(chave: string, valor: string | null) {
    try {
      if (valor === null) localStorage.removeItem(chave);
      else localStorage.setItem(chave, valor);
    } catch {
      // sem localStorage (aba anônima, bloqueado): segue sem rascunho
    }
  },
};

export const lerToken = () => armazenamento.ler(CHAVE_TOKEN);
export const gravarToken = (token: string | null) => armazenamento.gravar(CHAVE_TOKEN, token);

/** Erro que veio da API, com o corpo { status, erro, mensagem, dica }. */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly dica?: string,
  ) {
    super(mensagem);
  }
}

/** A requisição nem chegou ao servidor (sem internet, servidor fora do ar). */
export class ErroDeRede extends Error {
  constructor() {
    super("Sem conexão com o servidor.");
  }
}

export async function api<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const cabecalhos: Record<string, string> = {};
  const token = lerToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";

  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroDeRede();
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    // resposta que não é JSON (ex.: página de erro do proxy)
  }

  if (!resposta.ok) {
    const erro = (dados ?? {}) as { mensagem?: string; dica?: string };
    throw new ErroApi(resposta.status, erro.mensagem ?? `Erro ${resposta.status}`, erro.dica);
  }
  return dados as T;
}

export const mensagemDeErro = (erro: unknown) =>
  erro instanceof Error ? erro.message : "Algo deu errado. Tente de novo.";
