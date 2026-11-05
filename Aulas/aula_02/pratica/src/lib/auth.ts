import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export type Papel = "INVESTIDOR" | "ADMIN";

export interface UsuarioDoToken {
  id: number;
  usuario: string;
  papel: Papel;
}

interface ConteudoDoToken {
  sub: string;
  usuario: string;
  papel: Papel;
  aviso: string;
}

export function gerarToken(usuario: UsuarioDoToken): string {
  const conteudo: ConteudoDoToken = {
    sub: String(usuario.id),
    usuario: usuario.usuario,
    papel: usuario.papel,
    // Aparece para quem decodificar o token na Prática 3.
    aviso: "Este token é ASSINADO, não criptografado: qualquer um consegue ler. Por isso só use HTTPS!",
  };
  return jwt.sign(conteudo, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN_SECONDS });
}

/** Lança jwt.TokenExpiredError ou jwt.JsonWebTokenError se o token for inválido. */
export function verificarToken(token: string): UsuarioDoToken {
  const conteudo = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & ConteudoDoToken;
  return { id: Number(conteudo.sub), usuario: conteudo.usuario, papel: conteudo.papel };
}

export const gerarHashDaSenha = (senha: string) => bcrypt.hash(senha, 10);

export const conferirSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash);
