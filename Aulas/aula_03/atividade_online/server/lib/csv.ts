// CSV feito à mão (RFC 4180), pronto para o Excel em português:
// separador ";", UTF-8 com BOM (para os acentos) e quebra de linha CRLF.

const precisaDeAspas = /[";\r\n]/;

export function celula(valor: string | number | boolean | null | undefined): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  // Evita que o Excel interprete o texto do aluno como fórmula (=, +, -, @).
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return precisaDeAspas.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

export function gerarCsv(cabecalho: string[], linhas: (string | number | boolean | null | undefined)[][]): string {
  const todas = [cabecalho, ...linhas].map((linha) => linha.map(celula).join(";"));
  return "﻿" + todas.join("\r\n") + "\r\n";
}
