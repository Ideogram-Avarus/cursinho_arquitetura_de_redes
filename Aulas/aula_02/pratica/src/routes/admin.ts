import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { resetarDados } from "@/lib/seed";
import { ErroSchema, comToken } from "@/schemas/comum";

const TAG = "Professor";

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/admin",
    {
      schema: {
        tags: ["6. Autenticação", TAG],
        summary: "Área do professor (aluno logado → 403)",
        description: "Sem token: 401. Com token de aluno: 403. Com token de ADMIN: 200.",
        security: comToken,
        response: {
          200: z.object({
            mensagem: z.string(),
            estatisticas: z.object({
              usuarios: z.number().int(),
              batatas: z.number().int(),
              batatasCriadasPorAlunos: z.number().int(),
              ordens: z.number().int(),
              avaliacoes: z.number().int(),
            }),
          }),
          401: ErroSchema,
          403: ErroSchema,
        },
      },
      preHandler: app.exigirAdmin,
    },
    async (request) => {
      const [usuarios, batatas, batatasCriadasPorAlunos, ordens, avaliacoes] = await Promise.all([
        app.prisma.usuario.count(),
        app.prisma.batata.count(),
        app.prisma.batata.count({ where: { oficial: false } }),
        app.prisma.ordem.count(),
        app.prisma.avaliacao.count(),
      ]);
      return {
        mensagem: `Bem-vindo, ${request.usuario!.usuario}! Você tem acesso de ADMIN.`,
        estatisticas: { usuarios, batatas, batatasCriadasPorAlunos, ordens, avaliacoes },
      };
    },
  );

  app.post(
    "/admin/reset",
    {
      schema: {
        tags: [TAG],
        summary: "Apaga tudo e recria os dados de demonstração",
        description: "Use antes de cada turma. Todas as contas criadas pelos alunos são apagadas.",
        security: comToken,
        response: { 200: z.object({ mensagem: z.string() }), 401: ErroSchema, 403: ErroSchema },
      },
      preHandler: app.exigirAdmin,
    },
    async () => {
      await resetarDados(app.prisma);
      app.limitador.limpar();
      return { mensagem: "Dados de demonstração recriados. Os alunos precisam fazer login de novo." };
    },
  );
};

export default rotas;
