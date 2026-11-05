import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O front fica em web/ e é compilado para dist/web, que o Fastify serve em produção.
// No dev, o Vite (porta 5173) repassa /api e /docs (Swagger) para o Fastify (porta 3000): mesma origem, sem CORS.
export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  build: { outDir: "../dist/web", emptyOutDir: true },
  server: {
    host: true, // aceita conexões da rede local (dá para testar no celular)
    proxy: { "/api": "http://localhost:3000", "/docs": "http://localhost:3000" },
  },
});
