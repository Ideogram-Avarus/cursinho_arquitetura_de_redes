import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PASTA_PUBLICA } from "@/plugins/estaticos";
import { ErroSchema } from "@/schemas/comum";

const TAG = "8. Imagens e arquivos";

const IMAGENS = {
  "batata.png": "image/png",
  "batata.jpg": "image/jpeg",
} as const;

type NomeDaImagem = keyof typeof IMAGENS;
const NOMES = Object.keys(IMAGENS) as [NomeDaImagem, ...NomeDaImagem[]];

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/imagens/metadados",
    {
      schema: {
        tags: [TAG],
        summary: "Lista as imagens disponíveis, com tipo e tamanho",
        response: {
          200: z.object({
            imagens: z.array(
              z.object({ arquivo: z.string(), contentType: z.string(), tamanhoBytes: z.number().int(), url: z.string() }),
            ),
          }),
        },
      },
    },
    async () => ({
      imagens: await Promise.all(
        NOMES.map(async (arquivo) => ({
          arquivo,
          contentType: IMAGENS[arquivo],
          tamanhoBytes: (await stat(join(PASTA_PUBLICA, "imagens", arquivo))).size,
          url: `/api/imagens/${arquivo}`,
        })),
      ),
    }),
  );

  app.get(
    "/imagens/:arquivo",
    {
      schema: {
        tags: [TAG],
        summary: "Devolve uma imagem (resposta binária, não JSON)",
        description:
          "Repare no cabeçalho Content-Type: image/png ou image/jpeg. Com ?download=true vem o Content-Disposition: attachment e o navegador baixa o arquivo.",
        params: z.object({ arquivo: z.enum(NOMES) }),
        querystring: z.object({
          download: z.stringbool().optional().describe("true para baixar em vez de mostrar"),
        }),
        response: { 400: ErroSchema },
      },
    },
    async (request, reply) => {
      const { arquivo } = request.params;
      if (request.query.download) return reply.download(`imagens/${arquivo}`, arquivo);
      return reply.type(IMAGENS[arquivo]).sendFile(`imagens/${arquivo}`);
    },
  );
};

export default rotas;
