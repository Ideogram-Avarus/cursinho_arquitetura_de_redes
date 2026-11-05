import fp from "fastify-plugin";

/** Nome amigável do cliente, a partir do User-Agent. */
export function nomeDoCliente(userAgent?: string) {
  if (!userAgent) return "sem User-Agent";
  const conhecidos: [RegExp, string][] = [
    [/^curl\//i, "curl"],
    [/PostmanRuntime/i, "Postman"],
    [/insomnia/i, "Insomnia"],
    [/bruno/i, "Bruno"],
    [/Thunder Client/i, "Thunder Client"],
    [/hoppscotch/i, "Hoppscotch"],
    [/PowerShell/i, "PowerShell"],
    [/node-superagent|supertest/i, "teste automático"],
    [/Edg\//, "navegador (Edge)"],
    [/Firefox\//, "navegador (Firefox)"],
    [/Chrome\//, "navegador (Chrome)"],
    [/Safari\//, "navegador (Safari)"],
  ];
  const encontrado = conhecidos.find(([regex]) => regex.test(userAgent));
  return encontrado ? encontrado[1] : userAgent.slice(0, 40);
}

/**
 * Uma linha de log por requisição, fácil de ler no projetor (npm run dev ou fly logs):
 * ✅ GET /api/batatas → 200 (3 ms) — curl 👤 aluno
 */
export default fp(
  async (app) => {
    app.addHook("onSend", async (request, reply, payload) => {
      reply.header("X-Request-Id", request.id);
      return payload;
    });

    app.addHook("onResponse", async (request, reply) => {
      const status = reply.statusCode;
      const icone = status >= 500 ? "💥" : status >= 400 ? "⚠️ " : status >= 300 ? "↪️ " : "✅";
      const quem = request.usuario ? ` 👤 ${request.usuario.usuario}` : "";
      const mensagem = `${icone} ${request.method} ${request.url} → ${status} (${Math.round(reply.elapsedTime)} ms) — ${nomeDoCliente(request.headers["user-agent"])}${quem}`;

      // Arquivos internos do Swagger só poluiriam o log.
      if (request.url.startsWith("/docs/static") || request.url === "/favicon.ico") {
        request.log.debug(mensagem);
      } else if (status >= 500) {
        request.log.error(mensagem);
      } else if (status >= 400) {
        request.log.warn(mensagem);
      } else {
        request.log.info(mensagem);
      }
    });
  },
  { name: "logs" },
);
