// Salvamento automático com fila: cada mudança entra na fila (guardada no localStorage)
// e é enviada para a API logo depois. Se a rede cair, a fila espera e tenta de novo;
// recarregar a página não perde nada, porque a fila é o rascunho.
import { useSyncExternalStore } from "react";
import type { Marcacao, Valor } from "../../shared/questoes";
import { api, armazenamento, ErroApi, ErroDeRede } from "./api";

export interface CorpoPut {
  valor?: Valor;
  marcacao?: Marcacao | null;
}
export interface CorpoPatch {
  correcao?: string | null;
  motivoErro?: string | null;
  conferiu?: boolean | null;
}

type Pendentes = Record<string, { metodo: "PUT"; corpo: CorpoPut } | { metodo: "PATCH"; corpo: CorpoPatch }>;

export type Situacao = "salvo" | "salvando" | "sem-conexao";

export interface EstadoDaFila {
  situacao: Situacao;
  pendentes: Pendentes;
  /** Última recusa da API (ex.: 409 porque a fase mudou). */
  aviso: string | null;
}

const ESPERA_MS = 700;
const NOVA_TENTATIVA_MS = 5000;

export class FilaDeSalvamento {
  private estado: EstadoDaFila;
  private ouvintes = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private enviando = false;

  constructor(
    private readonly chave: string,
    private readonly aoSalvar: () => void,
    private readonly aoPerderLogin: () => void,
  ) {
    let pendentes: Pendentes = {};
    try {
      pendentes = JSON.parse(armazenamento.ler(chave) ?? "{}") as Pendentes;
    } catch {
      // rascunho corrompido: começa vazio
    }
    this.estado = { situacao: "salvo", pendentes, aviso: null };
    if (Object.keys(pendentes).length) this.agendar(0);
    if (typeof window !== "undefined") window.addEventListener("online", () => this.agendar(0));
  }

  assinar = (ouvinte: () => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };
  foto = () => this.estado;

  private mudar(parcial: Partial<EstadoDaFila>) {
    this.estado = { ...this.estado, ...parcial };
    armazenamento.gravar(this.chave, JSON.stringify(this.estado.pendentes));
    this.ouvintes.forEach((o) => o());
  }

  salvarResposta(questaoId: string, corpo: CorpoPut) {
    const anterior = this.estado.pendentes[`PUT ${questaoId}`];
    const juntos = { ...(anterior?.metodo === "PUT" ? anterior.corpo : {}), ...corpo };
    this.mudar({ pendentes: { ...this.estado.pendentes, [`PUT ${questaoId}`]: { metodo: "PUT", corpo: juntos } } });
    this.agendar(ESPERA_MS);
  }

  salvarCorrecao(questaoId: string, corpo: CorpoPatch) {
    const anterior = this.estado.pendentes[`PATCH ${questaoId}`];
    const juntos = { ...(anterior?.metodo === "PATCH" ? anterior.corpo : {}), ...corpo };
    this.mudar({ pendentes: { ...this.estado.pendentes, [`PATCH ${questaoId}`]: { metodo: "PATCH", corpo: juntos } } });
    this.agendar(ESPERA_MS);
  }

  /** Envia já (ex.: ao sair do campo). */
  enviarAgora() {
    this.agendar(0);
  }

  limparAviso() {
    this.mudar({ aviso: null });
  }

  private agendar(ms: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.enviar(), ms);
  }

  private async enviar() {
    if (this.enviando) return this.agendar(ESPERA_MS);
    const itens = Object.entries(this.estado.pendentes);
    if (!itens.length) return this.mudar({ situacao: "salvo" });

    this.enviando = true;
    this.mudar({ situacao: "salvando" });
    let semConexao = false;

    for (const [chave, pendente] of itens) {
      const questaoId = chave.split(" ")[1];
      try {
        await api(pendente.metodo, `/eu/respostas/${questaoId}`, pendente.corpo);
        this.tirar(chave, pendente);
      } catch (erro) {
        if (erro instanceof ErroApi && erro.status === 401) {
          this.enviando = false;
          return this.aoPerderLogin();
        }
        if (erro instanceof ErroDeRede || (erro instanceof ErroApi && (erro.status >= 500 || erro.status === 429))) {
          semConexao = true;
          break;
        }
        // 400/404/409: o servidor recusou (ex.: a fase mudou). Não adianta insistir.
        this.tirar(chave, pendente);
        this.mudar({ aviso: erro instanceof Error ? erro.message : "O servidor recusou a resposta." });
      }
    }

    this.enviando = false;
    if (semConexao) {
      this.mudar({ situacao: "sem-conexao" });
      this.agendar(NOVA_TENTATIVA_MS);
    } else if (Object.keys(this.estado.pendentes).length) {
      this.agendar(0); // chegou coisa nova enquanto enviava
    } else {
      this.mudar({ situacao: "salvo" });
      this.aoSalvar();
    }
  }

  /** Tira da fila, a não ser que o aluno tenha mudado a resposta enquanto ela era enviada. */
  private tirar(chave: string, enviado: Pendentes[string]) {
    if (this.estado.pendentes[chave] !== enviado) return;
    const { [chave]: _removido, ...resto } = this.estado.pendentes;
    this.mudar({ pendentes: resto });
  }
}

export function useFila(fila: FilaDeSalvamento) {
  return useSyncExternalStore(fila.assinar, fila.foto, fila.foto);
}
