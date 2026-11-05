import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const CABECALHOS_DE_PROXY = ["x-forwarded-for", "x-forwarded-proto", "x-forwarded-port", "fly-client-ip", "fly-region", "via"];

const rotas: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/seguranca",
    {
      schema: {
        tags: ["10. HTTPS e segurança"],
        summary: "O que o servidor sabe sobre a sua conexão",
        response: {
          200: z.object({
            protocolo: z.string(),
            conexaoSegura: z.boolean(),
            versaoHttpNaAplicacao: z.string(),
            ipCliente: z.string(),
            cabecalhosDoProxy: z.record(z.string(), z.string().nullable()),
            explicacao: z.array(z.string()),
          }),
        },
      },
    },
    async (request) => {
      const conexaoSegura = request.protocol === "https";
      const cabecalhosDoProxy = Object.fromEntries(
        CABECALHOS_DE_PROXY.map((nome) => [nome, (request.headers[nome] as string | undefined) ?? null]),
      );
      const viaProxy = Boolean(request.headers["x-forwarded-proto"]);

      return {
        protocolo: request.protocol,
        conexaoSegura,
        versaoHttpNaAplicacao: `HTTP/${request.raw.httpVersion}`,
        ipCliente: request.ip,
        cabecalhosDoProxy,
        explicacao: [
          conexaoSegura
            ? "Sua conexão chegou por HTTPS: o caminho até o servidor está criptografado com TLS."
            : "Sua conexão NÃO é HTTPS: senhas e tokens estariam visíveis para quem estiver no caminho!",
          viaProxy
            ? "Esta requisição passou por um proxy (como o do Fly.io): o TLS termina nele, e ele conta como a requisição chegou nos cabeçalhos X-Forwarded-*."
            : "Esta requisição chegou direto na aplicação, sem proxy: quem fez (ou não fez) o TLS foi o próprio servidor.",
          "Os cabeçalhos X-Forwarded-* podem ser falsificados por qualquer cliente. O servidor só confia neles porque está configurado para ficar atrás de um proxy conhecido (trustProxy).",
          "Veja o certificado clicando no cadeado do navegador: emissor, validade e domínio.",
        ],
      };
    },
  );
};

export default rotas;
