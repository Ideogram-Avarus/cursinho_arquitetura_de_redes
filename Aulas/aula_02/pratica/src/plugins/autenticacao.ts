import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { verificarToken } from "@/lib/auth";
import { naoAutenticado, proibido } from "@/lib/erros";

export default fp(
  async (app) => {
    app.decorate("autenticar", async (request) => {
      const cabecalho = request.headers.authorization;
      if (!cabecalho) {
        throw naoAutenticado(
          "Você precisa enviar um token para acessar esta rota.",
          "Faça login em POST /api/auth/login e envie o cabeçalho: Authorization: Bearer <seu token>",
        );
      }

      const [tipo, token] = cabecalho.split(" ");
      if (tipo !== "Bearer" || !token) {
        throw naoAutenticado(
          "O cabeçalho Authorization está no formato errado.",
          "O formato certo é: Authorization: Bearer <seu token> (a palavra Bearer, um espaço e o token).",
        );
      }

      try {
        request.usuario = verificarToken(token);
      } catch (erro) {
        if (erro instanceof jwt.TokenExpiredError) {
          throw naoAutenticado("Seu token expirou.", "Faça login de novo em POST /api/auth/login.");
        }
        throw naoAutenticado("Token inválido.", "Copie o token inteiro, sem aspas e sem espaços sobrando.");
      }

      // Confere id E nome: depois de um reset os IDs são reaproveitados por outras contas.
      const existe = await app.prisma.usuario.count({
        where: { id: request.usuario.id, usuario: request.usuario.usuario },
      });
      if (!existe) {
        request.usuario = undefined;
        throw naoAutenticado(
          "O usuário deste token não existe mais.",
          "O banco pode ter sido reiniciado pelo professor. Faça login de novo.",
        );
      }
    });

    app.decorate("exigirAdmin", async (request, reply) => {
      await app.autenticar(request, reply);
      if (request.usuario?.papel !== "ADMIN") {
        throw proibido(
          "Você está logado, mas não tem permissão para acessar esta rota.",
          "Esta área é só do professor (papel ADMIN). Isso é um 403: o servidor sabe QUEM você é, mas você NÃO PODE.",
        );
      }
    });
  },
  { name: "autenticacao" },
);
