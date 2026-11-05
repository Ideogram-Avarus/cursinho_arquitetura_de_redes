import { arredondar } from "@/lib/mercado";

export interface Pregao {
  data: string;
  abertura: number;
  fechamento: number;
  maxima: number;
  minima: number;
  volume: number;
}

export const DIAS_DE_HISTORICO = 365;

/** Gerador pseudoaleatório com semente: o mesmo ticker sempre gera o mesmo histórico. */
function geradorComSemente(texto: string) {
  let semente = 0;
  for (const letra of texto) semente = (Math.imul(semente, 31) + letra.charCodeAt(0)) | 0;
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Histórico simulado de pregões, do mais recente para o mais antigo.
 * Começa no preço atual e "anda para trás" no tempo com variações aleatórias.
 */
export function gerarHistorico(ticker: string, precoAtual: number, hoje = new Date()): Pregao[] {
  const aleatorio = geradorComSemente(ticker);
  const pregoes: Pregao[] = [];
  let fechamento = precoAtual;

  for (let dia = 0; dia < DIAS_DE_HISTORICO; dia++) {
    const data = new Date(hoje);
    data.setUTCDate(hoje.getUTCDate() - dia);

    const variacaoDoDia = (aleatorio() - 0.5) * 0.08;
    const abertura = Math.max(0.01, fechamento / (1 + variacaoDoDia));
    const maxima = Math.max(abertura, fechamento) * (1 + aleatorio() * 0.02);
    const minima = Math.min(abertura, fechamento) * (1 - aleatorio() * 0.02);

    pregoes.push({
      data: data.toISOString().slice(0, 10),
      abertura: arredondar(abertura),
      fechamento: arredondar(fechamento),
      maxima: arredondar(maxima),
      minima: Math.max(0.01, arredondar(minima)),
      volume: Math.round(1000 + aleatorio() * 50000),
    });

    fechamento = abertura;
  }

  return pregoes;
}
