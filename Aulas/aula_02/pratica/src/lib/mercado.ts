import type { Batata } from "@/generated/prisma/client";

export const arredondar = (valor: number) => Math.round(valor * 100) / 100;

/**
 * Lei da oferta e da procura (bem simplificada):
 * cada ação comprada sobe o preço 0,1% e cada ação vendida desce 0,1%,
 * limitado a 20% por ordem e a um preço mínimo de R$ 0,01.
 */
export function precoAposOrdem(precoAtual: number, tipo: "COMPRA" | "VENDA", quantidade: number) {
  const variacao = Math.min(quantidade * 0.001, 0.2);
  const fator = tipo === "COMPRA" ? 1 + variacao : 1 - variacao;
  return Math.max(0.01, arredondar(precoAtual * fator));
}

export function serializarBatata(batata: Batata) {
  return {
    id: batata.id,
    ticker: batata.ticker,
    nome: batata.nome,
    setor: batata.setor,
    preco: batata.preco,
    descricao: batata.descricao,
    oficial: batata.oficial,
    criadoPor: batata.criadoPor,
    criadoEm: batata.criadoEm.toISOString(),
    atualizadoEm: batata.atualizadoEm.toISOString(),
  };
}
