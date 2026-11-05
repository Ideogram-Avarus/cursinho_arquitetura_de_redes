import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { esquemaCadastro, esquemaLogin } from "../../shared/esquemas.js";
import { conferirSenha, gerarHashDaSenha, gerarToken } from "../lib/auth.js";
import { ErroHttp } from "../lib/erros.js";

const respostaToken = z.object({ token: z.string(), usuario: z.string(), nome: z.string() });

const TAG = "Autenticação";

const auth: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/cadastro",
    {
      schema: {
        tags: [TAG],
        summary: "Cria a conta do aluno e já devolve o token",
        body: esquemaCadastro,
        response: { 201: respostaToken },
      },
    },
    async (request, reply) => {
      const { usuario, senha, nome } = request.body;
      const existe = await app.prisma.usuario.findUnique({ where: { usuario } });
      if (existe) {
        throw new ErroHttp(
          409,
          "Usuário já existe",
          `O usuário "${usuario}" já existe.`,
          "Escolha outro nome de usuário, ou entre com a sua senha.",
        );
      }
      const criado = await app.prisma.usuario.create({
        data: { usuario, nome, senhaHash: await gerarHashDaSenha(senha) },
      });
      return reply.code(201).send({ token: gerarToken(criado), usuario: criado.usuario, nome: criado.nome });
    },
  );

  app.post(
    "/auth/login",
    {
      schema: {
        tags: [TAG],
        summary: "Entra com usuário e senha e devolve o token",
        description: "No máximo 5 tentativas por minuto para cada usuário (depois vem 429).",
        body: esquemaLogin,
        response: { 200: respostaToken },
      },
      // 5 tentativas por minuto para cada usuário. Não dá para limitar só por IP:
      // na escola a turma toda sai pela mesma internet (o mesmo IP).
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
          hook: "preHandler",
          keyGenerator: (request) =>
            `login:${request.ip}:${(request.body as { usuario?: string } | undefined)?.usuario ?? ""}`,
        },
      },
    },
    async (request) => {
      const { usuario, senha } = request.body;
      const encontrado = await app.prisma.usuario.findUnique({ where: { usuario } });
      if (!encontrado || !(await conferirSenha(senha, encontrado.senhaHash))) {
        throw new ErroHttp(401, "Não autenticado", "Usuário ou senha incorretos.");
      }
      return { token: gerarToken(encontrado), usuario: encontrado.usuario, nome: encontrado.nome };
    },
  );
};

export default auth;
