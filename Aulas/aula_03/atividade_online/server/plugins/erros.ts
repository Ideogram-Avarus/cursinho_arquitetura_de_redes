import type { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import { ErroHttp } from "../lib/erros.js";

const TRADUCOES: Record<string, { status: number; erro: string; mensagem: string; dica?: string }> = {
  FST_ERR_CTP_INVALID_JSON_BODY: {
    status: 400,
    erro: "JSON inválido",
    mensagem: "O corpo da requisição não é um JSON válido.",
    dica: "Confira as aspas duplas, as vírgulas e as chaves.",
  },
  FST_ERR_CTP_EMPTY_JSON_BODY: {
    status: 400,
    erro: "Corpo vazio",
    mensagem: "O Content-Type diz que o corpo é JSON, mas o corpo veio vazio.",
  },
  FST_ERR_CTP_INVALID_MEDIA_TYPE: {
    status: 415,
    erro: "Tipo de conteúdo não suportado",
    mensagem: "O servidor só entende JSON.",
    dica: "Use o cabeçalho Content-Type: application/json",
  },
  FST_ERR_CTP_BODY_TOO_LARGE: { status: 413, erro: "Corpo grande demais", mensagem: "O corpo passou do limite." },
};

export default fp(
  async (app) => {
    app.setErrorHandler((erro: FastifyError & { status?: number }, request, reply) => {
      if (erro instanceof ErroHttp) {
        return reply
          .code(erro.status)
          .send({ status: erro.status, erro: erro.erro, mensagem: erro.message, dica: erro.dica });
      }
      if (hasZodFastifySchemaValidationErrors(erro)) {
        const detalhes = erro.validation.map((p) => ({
          campo: [erro.validationContext, ...p.instancePath.split("/").filter(Boolean)].join("."),
          problema: p.message,
        }));
        return reply.code(400).send({
          status: 400,
          erro: "Requisição inválida",
          mensagem: detalhes[0]?.problema ?? "Alguns dados não estão no formato esperado.",
          detalhes,
        });
      }
      if (erro.statusCode === 429) return reply.code(429).send(erro);
      if (isResponseSerializationError(erro)) {
        request.log.error({ err: erro }, "A resposta não bate com o schema");
        return reply.code(500).send({ status: 500, erro: "Erro interno do servidor", mensagem: "A culpa não é sua!" });
      }
      const traducao = erro.code ? TRADUCOES[erro.code] : undefined;
      if (traducao) return reply.code(traducao.status).send(traducao);

      const status = erro.statusCode && erro.statusCode >= 400 ? erro.statusCode : 500;
      if (status >= 500) {
        request.log.error({ err: erro }, "Erro inesperado");
        return reply.code(status).send({
          status,
          erro: "Erro interno do servidor",
          mensagem: "Algo deu errado no servidor. A culpa não é sua!",
        });
      }
      return reply.code(status).send({ status, erro: "Erro na requisição", mensagem: erro.message });
    });
  },
  { name: "erros" },
);
