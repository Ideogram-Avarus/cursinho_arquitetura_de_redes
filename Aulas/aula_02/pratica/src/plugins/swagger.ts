import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export default fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        openapi: "3.0.3",
        info: {
          title: "🥔 Bolsa de Batatas",
          version: "1.0.0",
          description: [
            "API REST de treino para a aula de HTTP: um mercado de ações onde as empresas são batatas.",
            "",
            "**Como testar:** abra uma rota → *Try it out* → preencha → *Execute*.",
            "",
            "**Rotas com cadeado** precisam de token: faça login em `POST /api/auth/login`",
            "(usuário `aluno`, senha `senha-demo`, ou crie sua conta em `POST /api/auth/registro`),",
            "copie o `tokenAcesso`, clique em **Authorize** e cole o token.",
          ].join("\n"),
        },
        tags: [
          { name: "1. Primeiros passos", description: "GET simples, cabeçalhos e status 200" },
          { name: "2. Parâmetros de URL", description: "Query string (?chave=valor) e parâmetros de caminho (/batatas/42)" },
          { name: "3. Respostas e erros", description: "Códigos de status, latência e erros de propósito" },
          { name: "4. Enviando dados (POST)", description: "Corpo da requisição em JSON e criação de recursos (201)" },
          { name: "5. Alterar e apagar", description: "PUT, PATCH e DELETE" },
          { name: "6. Autenticação", description: "Login, token Bearer, 401 × 403" },
          { name: "7. Mercado (com token)", description: "Compre e venda batatas com a sua carteira" },
          { name: "8. Imagens e arquivos", description: "Content-Type, respostas binárias, download e upload" },
          { name: "9. Cache", description: "Cache-Control, ETag e 304 Not Modified" },
          { name: "10. HTTPS e segurança", description: "O que o servidor sabe sobre a sua conexão" },
          { name: "11. Limites e paginação", description: "429 Too Many Requests e listas grandes" },
          { name: "Professor", description: "Rotas só para o papel ADMIN" },
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
