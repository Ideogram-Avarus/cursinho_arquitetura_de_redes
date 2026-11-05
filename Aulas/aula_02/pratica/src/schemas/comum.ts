import { z } from "zod";
import { SETORES } from "@/lib/seed";

export const ErroSchema = z
  .object({
    status: z.number(),
    erro: z.string(),
    mensagem: z.string(),
    dica: z.string().optional(),
    detalhes: z.array(z.object({ campo: z.string(), problema: z.string() })).optional(),
  })
  .describe("Formato de todas as respostas de erro");

export const SetorSchema = z.enum(SETORES).describe("Setor da batata na bolsa");

export const BatataSchema = z.object({
  id: z.number().int(),
  ticker: z.string(),
  nome: z.string(),
  setor: z.string(),
  preco: z.number(),
  descricao: z.string().nullable(),
  oficial: z.boolean(),
  criadoPor: z.string().nullable(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});

export const PaginacaoSchema = z.object({
  pagina: z.number().int(),
  limite: z.number().int(),
  total: z.number().int(),
  totalPaginas: z.number().int(),
});

export const PaginacaoQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1).describe("Número da página (começa em 1)"),
  limite: z.coerce.number().int().min(1).max(100).default(10).describe("Itens por página (máx. 100)"),
});

export const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive().describe("ID numérico do recurso"),
});

/** Usado nas rotas que exigem token (aparece o cadeado no Swagger). */
export const comToken = [{ bearerAuth: [] }];

export function paginar(pagina: number, limite: number, total: number) {
  return { pagina, limite, total, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
}
