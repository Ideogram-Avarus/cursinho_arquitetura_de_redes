import { env } from "@/config/env";
import { gerarHashDaSenha } from "@/lib/auth";
import type { Prisma } from "@/lib/prisma";

export const SETORES = ["tradicional", "gourmet", "doce", "exotica", "processada"] as const;
export type Setor = (typeof SETORES)[number];

export const USUARIO_DEMO = { usuario: "aluno", senha: "senha-demo" };
export const USUARIO_ADMIN = { usuario: "professor" };

export const BATATAS_OFICIAIS: { ticker: string; nome: string; setor: Setor; preco: number; descricao: string }[] = [
  { ticker: "INGL3", nome: "Batata Inglesa", setor: "tradicional", preco: 4.5, descricao: "A blue chip do tubérculo: estável, vai bem com tudo." },
  { ticker: "ASTX3", nome: "Batata Asterix", setor: "tradicional", preco: 5.2, descricao: "Casca vermelha, ótima para fritar. Queridinha dos fundos de investimento." },
  { ticker: "MONA3", nome: "Batata Monalisa", setor: "tradicional", preco: 4.8, descricao: "Clássica e versátil, sorri para qualquer receita." },
  { ticker: "AGAT3", nome: "Batata Ágata", setor: "tradicional", preco: 3.9, descricao: "A mais barata do pregão. Boa para quem está começando." },
  { ticker: "BARO4", nome: "Batata Baroa", setor: "gourmet", preco: 12.9, descricao: "Também conhecida como mandioquinha. Ação premium." },
  { ticker: "BOLN3", nome: "Batata Bolinha", setor: "gourmet", preco: 9.7, descricao: "Pequena no tamanho, grande no dividendo." },
  { ticker: "DOCE3", nome: "Batata Doce", setor: "doce", preco: 3.4, descricao: "Preferida dos atletas. Alta procura antes do verão." },
  { ticker: "DOCR4", nome: "Batata Doce Roxa", setor: "doce", preco: 6.8, descricao: "A versão roxa da batata doce, com mais antioxidantes e mais volatilidade." },
  { ticker: "YACN3", nome: "Batata Yacon", setor: "exotica", preco: 15.3, descricao: "Exótica e crocante. Investimento de risco." },
  { ticker: "ROXA3", nome: "Batata Roxa Peruana", setor: "exotica", preco: 18.75, descricao: "Importada dos Andes. Cotação nas alturas." },
  { ticker: "FRIT3", nome: "Batata Frita S.A.", setor: "processada", preco: 22.1, descricao: "Maior empresa do setor. Sempre acompanha o lanche." },
  { ticker: "PALH3", nome: "Batata Palha Crocante", setor: "processada", preco: 8.6, descricao: "Indispensável no estrogonofe do domingo." },
  { ticker: "CHIP4", nome: "Chips Ondulada Holding", setor: "processada", preco: 14.2, descricao: "O saquinho é metade ar, mas a ação é sólida." },
  { ticker: "PURE3", nome: "Purê Cremoso Participações", setor: "processada", preco: 7.45, descricao: "Empresa macia, risco baixo, retorno amassado." },
];

/** Apaga tudo e recria os dados de demonstração (os IDs voltam a começar em 1). */
export async function resetarDados(prisma: Prisma) {
  await prisma.$transaction([
    prisma.ordem.deleteMany(),
    prisma.posicao.deleteMany(),
    prisma.avaliacao.deleteMany(),
    prisma.batata.deleteMany(),
    prisma.usuario.deleteMany(),
    // Zera os contadores de AUTOINCREMENT do SQLite.
    prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence"),
  ]);

  await prisma.batata.createMany({
    data: BATATAS_OFICIAIS.map((batata) => ({ ...batata, oficial: true, criadoPor: "Bolsa de Batatas" })),
  });

  await prisma.usuario.createMany({
    data: [
      { usuario: USUARIO_DEMO.usuario, senhaHash: await gerarHashDaSenha(USUARIO_DEMO.senha), papel: "INVESTIDOR" },
      { usuario: USUARIO_ADMIN.usuario, senhaHash: await gerarHashDaSenha(env.ADMIN_PASSWORD), papel: "ADMIN" },
    ],
  });
}

/** Cria os dados de demonstração só se o banco estiver vazio (primeira subida no Fly.io). */
export async function garantirDados(prisma: Prisma) {
  const quantidade = await prisma.batata.count();
  if (quantidade === 0) {
    await resetarDados(prisma);
    return true;
  }
  return false;
}
