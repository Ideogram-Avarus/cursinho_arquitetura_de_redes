import type { FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { verificarToken } from "../lib/auth.js";
import { ErroHttp } from "../lib/erros.js";

const naoLogado = (mensagem: string) =>
  new ErroHttp(401, "Não autenticado", mensagem, "Entre de novo com seu usuário e senha.");

// Só as rotas do ALUNO exigem login. O painel do professor é aberto, de propósito.
export default fp(
  async (app) => {
    app.decorateRequest("aluno", null as never);
    app.decorate("autenticar", async (request: FastifyRequest) => {
      const cabecalho = request.headers.authorization;
      if (!cabecalho?.startsWith("Bearer ")) {
        throw naoLogado('Faltou o cabeçalho "Authorization: Bearer <token>".');
      }
      let aluno;
      try {
        aluno = verificarToken(cabecalho.slice(7));
      } catch {
        throw naoLogado("O token é inválido ou venceu.");
      }
      // O banco pode ter sido reimportado: o id do token precisa ser do mesmo usuário.
      const existe = await app.prisma.usuario.findUnique({ where: { id: aluno.id }, select: { usuario: true } });
      if (existe?.usuario !== aluno.usuario) throw naoLogado("Sua conta não foi encontrada.");
      request.aluno = aluno;
    });
  },
  { name: "autenticacao" },
);
