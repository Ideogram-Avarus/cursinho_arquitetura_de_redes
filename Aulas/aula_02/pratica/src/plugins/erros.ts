import type { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import { ErroHttp } from "@/lib/erros";

interface Traducao {
  status: number;
  erro: string;
  mensagem: string;
  dica?: string;
}

/** Erros internos do Fastify e do multipart, traduzidos para o aluno. */
const TRADUCOES: Record<string, Traducao> = {
  FST_ERR_CTP_INVALID_JSON_BODY: {
    status: 400,
    erro: "JSON inválido",
    mensagem: "O corpo da requisição não é um JSON válido.",
    dica: 'Confira as aspas duplas, as vírgulas e as chaves. Exemplo: {"nome": "Batata", "preco": 5}',
  },
  FST_ERR_CTP_EMPTY_JSON_BODY: {
    status: 400,
    erro: "Corpo vazio",
    mensagem: "O cabeçalho Content-Type diz que o corpo é JSON, mas o corpo veio vazio.",
    dica: "Envie um JSON no corpo da requisição.",
  },
  FST_ERR_CTP_INVALID_MEDIA_TYPE: {
    status: 415,
    erro: "Tipo de conteúdo não suportado",
    mensagem: "O servidor não sabe ler o corpo no formato informado no Content-Type.",
    dica: "Use o cabeçalho Content-Type: application/json",
  },
  FST_ERR_CTP_BODY_TOO_LARGE: {
    status: 413,
    erro: "Corpo grande demais",
    mensagem: "O corpo da requisição passou do limite de 100 KB.",
  },
  FST_ERR_CTP_INVALID_CONTENT_LENGTH: {
    status: 400,
    erro: "Content-Length inválido",
    mensagem: "O cabeçalho Content-Length não bate com o tamanho do corpo.",
  },
  FST_REQ_FILE_TOO_LARGE: {
    status: 413,
    erro: "Arquivo grande demais",
    mensagem: "O arquivo passou do limite de 1 MB.",
  },
  FST_FILES_LIMIT: { 
    status: 413, 
    erro: "Arquivos demais", 
    mensagem: "Envie apenas um arquivo por vez." 
  },
  FST_PARTS_LIMIT: { 
    status: 413, 
    erro: "Partes demais", 
    mensagem: "O formulário tem partes demais." 
  },
  FST_FIELDS_LIMIT: { 
    status: 413, 
    erro: "Campos demais", 
    mensagem: "O formulário tem campos demais." 
  },
  FST_INVALID_MULTIPART_CONTENT_TYPE: {
    status: 415,
    erro: "Esperado multipart/form-data",
    mensagem: "Para enviar arquivos, o Content-Type precisa ser multipart/form-data.",
  },
};

export default fp(
  async (app) => {
    app.setErrorHandler((erro: FastifyError, request, reply) => {
      if (erro instanceof ErroHttp) {
        return reply
          .code(erro.status)
          .headers(erro.cabecalhos)
          .send({ status: erro.status, erro: erro.erro, mensagem: erro.message, dica: erro.dica });
      }

      if (hasZodFastifySchemaValidationErrors(erro)) {
        const detalhes = erro.validation.map((problema) => ({
          campo: [erro.validationContext, ...problema.instancePath.split("/").filter(Boolean)].join("."),
          problema: problema.message,
        }));
        return reply.code(400).send({
          status: 400,
          erro: "Requisição inválida",
          mensagem: "Alguns dados enviados não estão no formato esperado.",
          dica: "Veja em 'detalhes' qual campo está errado. O formato certo está na documentação (/docs).",
          detalhes,
        });
      }

      if (isResponseSerializationError(erro)) {
        request.log.error({ err: erro }, "A resposta não bate com o schema");
        return reply.code(500).send({
          status: 500,
          erro: "Erro interno do servidor",
          mensagem: "O servidor montou uma resposta errada. A culpa não é sua!",
        });
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

    app.setNotFoundHandler((request, reply) => {
      const caminho = request.url.split("?")[0];
      const metodos = app.metodosPermitidos(caminho);

      if (metodos.length > 0) {
        return reply
          .code(405)
          .header("Allow", metodos.join(", "))
          .send({
            status: 405,
            erro: "Método não permitido",
            mensagem: `O caminho ${caminho} existe, mas não aceita o método ${request.method}.`,
            dica: `Métodos aceitos: ${metodos.join(", ")}`,
          });
      }

      return reply.code(404).send({
        status: 404,
        erro: "Não encontrado",
        mensagem: `A rota ${request.method} ${caminho} não existe.`,
        dica: "Confira o endereço. A lista de todas as rotas está em /docs.",
      });
    });
  },
  { name: "erros" },
);
