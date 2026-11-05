import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "@/config/env";
import { conferirSenha, gerarHashDaSenha, gerarToken, type Papel } from "@/lib/auth";
import { conflito, naoAutenticado } from "@/lib/erros";
import { ErroSchema, comToken } from "@/schemas/comum";

const TAG = "6. Autenticação";

const UsuarioSchema = z.object({ id: z.number().int(), usuario: z.string(), papel: z.string() });

const RespostaTokenSchema = z.object({
  tokenAcesso: z.string(),
  tipoToken: z.literal("Bearer"),
  expiraEmSegundos: z.number().int(),
  usuario: UsuarioSchema,
  comoUsar: z.string(),
});

const CredenciaisSchema = z.object({
  usuario: z.string().trim().toLowerCase().min(1).max(20),
  senha: z.string().min(1).max(72),
});

function respostaComToken(usuario: { id: number; usuario: string; papel: string }) {
  const dados = { id: usuario.id, usuario: usuario.usuario, papel: usuario.papel as Papel };
  return {
    tokenAcesso: gerarToken(dados),
    tipoToken: "Bearer" as const,
    expiraEmSegundos: env.JWT_EXPIRES_IN_SECONDS,
    usuario: dados,
    comoUsar: "Envie em toda requisição o cabeçalho: Authorization: Bearer <tokenAcesso>",
  };
}

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/registro",
    {
      schema: {
        tags: [TAG],
        summary: "Cria a sua conta de investidor (começa com R$ 10.000)",
        description: "Use um apelido, NUNCA seu nome completo, e-mail ou uma senha que você usa em outro lugar.",
        body: z
          .object({
            usuario: z
              .string()
              .trim()
              .toLowerCase()
              .regex(/^[a-z0-9_.-]{3,20}$/, "Use de 3 a 20 caracteres: letras minúsculas, números, _ . ou -"),
            senha: z.string().min(6).max(72),
          })
          .meta({ examples: [{ usuario: "batateiro99", senha: "minha-senha" }] }),
        response: {
          201: UsuarioSchema.extend({ saldo: z.number(), mensagem: z.string() }),
          400: ErroSchema,
          409: ErroSchema,
        },
      },
    },
    async (request, reply) => {
      const { usuario, senha } = request.body;
      if (await app.prisma.usuario.findUnique({ where: { usuario } })) {
        throw conflito(`O usuário "${usuario}" já existe.`, "Escolha outro apelido. Isso é um 409 Conflict.");
      }

      const criado = await app.prisma.usuario.create({
        data: { usuario, senhaHash: await gerarHashDaSenha(senha) },
      });
      return reply.code(201).header("Location", "/api/perfil").send({
        id: criado.id,
        usuario: criado.usuario,
        papel: criado.papel,
        saldo: criado.saldo,
        mensagem: "Conta criada! Agora faça login em POST /api/auth/login para receber o seu token.",
      });
    },
  );

  app.post(
    "/auth/login",
    {
      schema: {
        tags: [TAG],
        summary: "Faz login e recebe um token (JWT)",
        description: "Conta de demonstração: usuário 'aluno', senha 'senha-demo'.",
        body: CredenciaisSchema.meta({ examples: [{ usuario: "aluno", senha: "senha-demo" }] }),
        response: { 200: RespostaTokenSchema, 400: ErroSchema, 401: ErroSchema },
      },
    },
    async (request) => {
      const { usuario, senha } = request.body;
      const encontrado = await app.prisma.usuario.findUnique({ where: { usuario } });
      // Mesma mensagem para usuário inexistente e senha errada: não entrega qual dos dois errou.
      if (!encontrado || !(await conferirSenha(senha, encontrado.senhaHash))) {
        throw naoAutenticado("Usuário ou senha incorretos.", "A conta de demonstração é aluno / senha-demo.");
      }
      return respostaComToken(encontrado);
    },
  );

  app.post(
    "/auth/renovar",
    {
      schema: {
        tags: [TAG],
        summary: "Troca um token válido por um novo (com prazo renovado)",
        security: comToken,
        response: { 200: RespostaTokenSchema, 401: ErroSchema },
      },
      preHandler: app.autenticar,
    },
    async (request) => {
      const usuario = await app.prisma.usuario.findUniqueOrThrow({ where: { id: request.usuario!.id } });
      return respostaComToken(usuario);
    },
  );
};

export default rotas;
