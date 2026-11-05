import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { esquemaExport } from "../../shared/esquemas.js";
import { exportarCsv, exportarJson, importarJson, marcarExport } from "../lib/dados.js";

/** "2026-11-03_14h05" (hora UTC), para o nome do arquivo. */
const carimbo = () => new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "h");

const TAG = "Dados";

const exportar: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/professor/exportar",
    {
      schema: {
        tags: [TAG],
        summary: "Baixa o banco inteiro em JSON ou CSV",
        querystring: z.object({ formato: z.enum(["json", "csv"]).default("json") }),
      },
    },
    async (request, reply) => {
      const { formato } = request.query;
      const nome = `atividade-aula03_${carimbo()}.${formato}`;
      const conteudo =
        formato === "json" ? JSON.stringify(await exportarJson(app.prisma), null, 2) : await exportarCsv(app.prisma);
      await marcarExport(app.prisma);
      request.log.info(`💾 Export ${formato.toUpperCase()} baixado`);
      return reply
        .header("Content-Disposition", `attachment; filename="${nome}"`)
        .header("Cache-Control", "no-store")
        .type(formato === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8")
        .send(conteudo);
    },
  );

  // O arquivo é validado no formato do export: se não bater, volta 400 e o banco não é tocado.
  app.post(
    "/professor/importar",
    {
      bodyLimit: 10 * 1024 * 1024,
      schema: {
        tags: [TAG],
        summary: "Restaura o banco a partir de um export JSON",
        description: "⚠️ Substitui TODOS os dados atuais.",
        body: esquemaExport,
        response: { 200: z.object({ usuarios: z.number(), respostas: z.number(), fase: z.string() }) },
      },
    },
    async (request) => {
      const resultado = await importarJson(app.prisma, request.body);
      request.log.warn(`♻️  Banco restaurado do JSON: ${resultado.usuarios} alunos, ${resultado.respostas} respostas`);
      return resultado;
    },
  );
};

export default exportar;
