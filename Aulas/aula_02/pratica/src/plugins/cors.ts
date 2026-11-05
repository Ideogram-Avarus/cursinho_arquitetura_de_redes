import cors from "@fastify/cors";
import fp from "fastify-plugin";

// Libera chamadas de outras origens (Hoppscotch, fetch de outro site, front-end dos alunos).
export default fp(
  async (app) => {
    await app.register(cors, {
      origin: true,
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposedHeaders: [
        "Location",
        "ETag",
        "X-Request-Id",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
        "Content-Disposition",
      ],
    });
  },
  // Depois de "rotas": o hook dela responde o OPTIONS "puro" (com Allow) antes do CORS.
  { name: "cors", dependencies: ["rotas"] },
);
