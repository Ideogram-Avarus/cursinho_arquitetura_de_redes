import { createHash } from "node:crypto";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErroHttp, requisicaoInvalida } from "@/lib/erros";
import { ErroSchema } from "@/schemas/comum";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/gif", "text/plain", "application/pdf"];

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/arquivos",
    {
      schema: {
        tags: ["8. Imagens e arquivos"],
        summary: "Envia um arquivo pequeno (upload com multipart/form-data)",
        description: `Campo do formulário: "arquivo". Máximo 1 MB. Tipos aceitos: ${TIPOS_PERMITIDOS.join(", ")}. O arquivo NÃO fica guardado no servidor.`,
        consumes: ["multipart/form-data"],
        body: z.object({ arquivo: z.file().describe("O arquivo a enviar") }),
        response: {
          201: z.object({
            mensagem: z.string(),
            arquivo: z.object({ nome: z.string(), tipo: z.string(), tamanhoBytes: z.number().int(), sha256: z.string() }),
            aviso: z.string(),
          }),
          400: ErroSchema,
          413: ErroSchema,
          415: ErroSchema,
        },
      },
      // O corpo multipart é lido na mão (request.file()); o schema do body serve só para a documentação.
      validatorCompiler: () => (dados) => ({ value: dados }),
    },
    async (request, reply) => {
      if (!request.isMultipart()) {
        throw new ErroHttp(
          415,
          "Esperado multipart/form-data",
          "Para enviar arquivos, o Content-Type precisa ser multipart/form-data.",
          'No curl: curl.exe -F "arquivo=@foto.png" https://<app>.fly.dev/api/arquivos',
        );
      }

      const parte = await request.file();
      if (!parte) throw requisicaoInvalida("Nenhum arquivo foi enviado.", 'Envie o arquivo no campo "arquivo".');

      if (!TIPOS_PERMITIDOS.includes(parte.mimetype)) {
        parte.file.resume(); // descarta o conteúdo
        throw new ErroHttp(
          415,
          "Tipo de arquivo não permitido",
          `Arquivos do tipo ${parte.mimetype} não são aceitos.`,
          `Tipos aceitos: ${TIPOS_PERMITIDOS.join(", ")}`,
        );
      }

      const conteudo = await parte.toBuffer(); // lança FST_REQ_FILE_TOO_LARGE (413) acima de 1 MB
      return reply.code(201).send({
        mensagem: "Arquivo recebido!",
        arquivo: {
          nome: parte.filename,
          tipo: parte.mimetype,
          tamanhoBytes: conteudo.length,
          sha256: createHash("sha256").update(conteudo).digest("hex"),
        },
        aviso: "O servidor só leu o arquivo para calcular tamanho e hash. Nada foi guardado.",
      });
    },
  );
};

export default rotas;
