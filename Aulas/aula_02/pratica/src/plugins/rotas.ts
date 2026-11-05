import fp from "fastify-plugin";
import { naoEncontrado } from "@/lib/erros";

/** Converte "/api/batatas/:id" em uma regex que casa com "/api/batatas/42". */
function paraRegex(url: string) {
  const partes = url.split("/").map((parte) => {
    if (parte.startsWith(":")) return "[^/]+";
    if (parte === "*") return ".*";
    return parte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  return new RegExp(`^${partes.join("/")}/?$`);
}

/**
 * Guarda quais métodos existem para cada caminho. Serve para:
 * - responder 405 (Method Not Allowed) com o cabeçalho Allow, em vez de 404;
 * - responder "OPTIONS /api/..." com o cabeçalho Allow.
 */
export default fp(
  async (app) => {
    const rotas = new Map<string, { regex: RegExp; metodos: Set<string> }>();

    app.addHook("onRoute", (rota) => {
      if (rota.url === "*" || rota.url === "/*") return;
      const metodos = Array.isArray(rota.method) ? rota.method : [rota.method];
      let registro = rotas.get(rota.url);
      if (!registro) {
        registro = { regex: paraRegex(rota.url), metodos: new Set() };
        rotas.set(rota.url, registro);
      }
      for (const metodo of metodos) registro.metodos.add(metodo);
    });

    app.decorate("metodosPermitidos", (caminho: string) => {
      const encontrados = new Set<string>();
      for (const { regex, metodos } of rotas.values()) {
        if (regex.test(caminho)) for (const metodo of metodos) encontrados.add(metodo);
      }
      if (encontrados.size === 0) return [];
      if (encontrados.has("GET")) encontrados.add("HEAD");
      encontrados.add("OPTIONS");
      const ordem = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
      return ordem.filter((metodo) => encontrados.has(metodo));
    });

    // OPTIONS "puro" (sem ser preflight de CORS): responde quais métodos o caminho aceita.
    app.addHook("onRequest", async (request, reply) => {
      if (request.method !== "OPTIONS" || request.headers["access-control-request-method"]) return;

      const caminho = request.url.split("?")[0];
      const metodos = app.metodosPermitidos(caminho);
      if (metodos.length === 0) throw naoEncontrado(`A rota ${caminho} não existe.`);

      return reply.code(204).header("Allow", metodos.join(", ")).send();
    });
  },
  { name: "rotas" },
);
