import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

// Documentação interativa da API em /docs (o JSON do OpenAPI fica em /docs/json).
// Precisa ser registrado ANTES das rotas: o @fastify/swagger coleta as rotas no onRoute.
export default fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        openapi: "3.0.3",
        info: {
          title: "📝 Atividade da Aula 03",
          version: "1.0.0",
          description: [
            "API do site da atividade de diagnóstico da Aula 03: os alunos respondem, o professor acompanha.",
            "",
            "**Como testar:** abra uma rota → *Try it out* → preencha → *Execute*.",
            "",
            "**Rotas com cadeado** (as do aluno) precisam de token: crie uma conta em `POST /api/auth/cadastro`",
            "ou entre em `POST /api/auth/login`, copie o `token`, clique em **Authorize** e cole o token.",
            "",
            "As rotas do professor são abertas, sem login (de propósito: o app só vive durante a aula).",
          ].join("\n"),
        },
        tags: [
          { name: "Público", description: "Status do servidor, questões e fase da aula" },
          { name: "Autenticação", description: "Cadastro e login do aluno (devolvem o token Bearer)" },
          { name: "Aluno", description: "Respostas do aluno logado (exigem token)" },
          { name: "Professor", description: "Painel: fase da aula, resumo e detalhes das questões" },
          { name: "Avaliações", description: "Avaliação das partes abertas das respostas" },
          { name: "Dados", description: "Exportar e importar o banco (backup)" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          },
        },
      },
      transform: jsonSchemaTransform,
    });

    await app.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
      },
    });
  },
  { name: "swagger" },
);
