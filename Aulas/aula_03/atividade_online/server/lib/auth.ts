import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

export interface AlunoDoToken {
  id: number;
  usuario: string;
}

export function gerarToken(aluno: AlunoDoToken): string {
  return jwt.sign({ sub: String(aluno.id), usuario: aluno.usuario }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  });
}

/** Lança erro do jsonwebtoken se o token for inválido ou estiver vencido. */
export function verificarToken(token: string): AlunoDoToken {
  const conteudo = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { usuario: string };
  return { id: Number(conteudo.sub), usuario: conteudo.usuario };
}

/** Lê o "Authorization: Bearer ..." sem lançar erro (para o rate-limit separar os alunos). */
export function alunoDoCabecalho(cabecalho: string | undefined): AlunoDoToken | null {
  if (!cabecalho?.startsWith("Bearer ")) return null;
  try {
    return verificarToken(cabecalho.slice(7));
  } catch {
    return null;
  }
}

export const gerarHashDaSenha = (senha: string) => bcrypt.hash(senha, 10);
export const conferirSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash);
