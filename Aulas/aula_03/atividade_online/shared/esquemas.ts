// Formatos (Zod) usados pelo servidor para validar e pelo front para tipar.
import { z } from "zod";
import { AVALIACOES, FASES, MARCACOES } from "./questoes.js";

export const LIMITE_TEXTO = 2000;
export const LIMITE_COMENTARIO = 500;

export const esquemaUsuario = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,20}$/, "Use de 3 a 20 letras minúsculas, números, ponto, hífen ou sublinhado (sem espaço).");

export const esquemaCadastro = z.object({
  usuario: esquemaUsuario,
  senha: z.string().min(4, "A senha precisa ter pelo menos 4 caracteres.").max(72),
  nome: z.string().trim().min(1, "Escreva seu nome ou apelido.").max(40),
});

export const esquemaLogin = z.object({
  usuario: z.string().trim().toLowerCase().min(1).max(20),
  senha: z.string().min(1).max(72),
});

export const esquemaMarcacao = z.enum(MARCACOES);
export const esquemaFase = z.enum(FASES);
export const esquemaNivelAvaliacao = z.enum(AVALIACOES);

/** Uma resposta: { chave: texto }. As chaves permitidas de cada questão são conferidas na rota. */
export const esquemaValor = z
  .record(z.string().max(40), z.string().max(LIMITE_TEXTO))
  .refine((v) => Object.keys(v).length <= 40, "Campos demais.");

export const esquemaSalvarResposta = z
  .object({
    valor: esquemaValor.optional(),
    marcacao: esquemaMarcacao.nullable().optional(),
  })
  .refine((c) => c.valor !== undefined || c.marcacao !== undefined, "Envie 'valor' ou 'marcacao'.");

export const esquemaSalvarCorrecao = z
  .object({
    correcao: z.string().max(LIMITE_TEXTO).nullable().optional(),
    motivoErro: z.string().max(LIMITE_TEXTO).nullable().optional(),
    conferiu: z.boolean().nullable().optional(),
  })
  .refine(
    (c) => c.correcao !== undefined || c.motivoErro !== undefined || c.conferiu !== undefined,
    "Envie 'correcao', 'motivoErro' ou 'conferiu'.",
  );

export const esquemaResposta = z.object({
  questaoId: z.string(),
  valor: esquemaValor,
  marcacao: esquemaMarcacao.nullable(),
  correcao: z.string().nullable(),
  motivoErro: z.string().nullable(),
  conferiu: z.boolean().nullable(),
  atualizadoEm: z.string(),
});
export type Resposta = z.infer<typeof esquemaResposta>;

/** Resultado de uma questão para o aluno, na fase de correção. */
export const esquemaCorrecaoDaQuestao = z.object({
  questaoId: z.string(),
  /** "pendente": tem parte aberta que ainda ninguém avaliou, e nada que já se saiba errado. */
  situacao: z.enum(["certa", "parcial", "errada", "pendente"]),
  /** Partes fechadas: se acertou e qual é a resposta certa. */
  partes: z.array(z.object({ chave: z.string(), certa: z.boolean(), esperada: z.string() })),
  /** Resposta esperada da parte aberta. */
  respostaEsperada: z.string().nullable(),
  /** O comentário da avaliação da parte aberta (a justificativa da IA). */
  justificativa: z.string().nullable(),
  /** Respondeu, mas deixou a parte aberta em branco. */
  abertaEmBranco: z.boolean(),
});
export type CorrecaoDaQuestao = z.infer<typeof esquemaCorrecaoDaQuestao>;

export const esquemaEu = z.object({
  id: z.number(),
  usuario: z.string(),
  nome: z.string(),
  respostas: z.array(esquemaResposta),
});
export type Eu = z.infer<typeof esquemaEu>;

export const esquemaEstado = z.object({
  fase: esquemaFase,
  ultimoExport: z.string().nullable(),
});
export type Estado = z.infer<typeof esquemaEstado>;

// ------------------------------------------------------------------ painel do professor

const contagemMarcacoes = z.object({ S: z.number(), C: z.number(), P: z.number(), "?": z.number() });

export const esquemaResumoQuestao = z.object({
  questaoId: z.string(),
  respostas: z.number(),
  marcacoes: contagemMarcacoes,
  /** Média de acerto (0 a 1) nas partes fechadas; null se a questão é aberta ou ninguém respondeu. */
  acerto: z.number().nullable(),
  /** Respostas que já têm nota: são elas que entram no `acerto`. */
  corrigidas: z.number(),
  conferiram: z.number(),
  corrigiram: z.number(),
  /** Respostas com parte aberta preenchida: quantas já foram avaliadas e quantas faltam. */
  avaliadas: z.number(),
  paraAvaliar: z.number(),
  /** 0 = fácil, 1 = difícil. Usado para ordenar o termômetro. */
  dificuldade: z.number(),
});
export type ResumoQuestao = z.infer<typeof esquemaResumoQuestao>;

export const esquemaResumo = z.object({
  alunos: z.number(),
  questoes: z.array(esquemaResumoQuestao),
});
export type Resumo = z.infer<typeof esquemaResumo>;

export const esquemaDetalheQuestao = z.object({
  questaoId: z.string(),
  marcacoes: contagemMarcacoes,
  /** Partes fechadas: contagem de cada valor e o que está certo. */
  fechadas: z.array(
    z.object({
      chave: z.string(),
      contagem: z.record(z.string(), z.number()),
      certas: z.array(z.string()),
      acerto: z.number().nullable(),
    }),
  ),
  /** Uma entrada por aluno que respondeu (os nomes só aparecem se o painel pedir). */
  respostas: z.array(
    z.object({
      /** Número do aluno (não é o nome): serve para salvar a avaliação. */
      usuarioId: z.number(),
      /** Versão da resposta (atualizadoEm): a avaliação só é aceita se a resposta não mudou. */
      versao: z.string(),
      nome: z.string().nullable(),
      valor: esquemaValor,
      marcacao: esquemaMarcacao.nullable(),
      correcao: z.string().nullable(),
      motivoErro: z.string().nullable(),
      conferiu: z.boolean().nullable(),
      acerto: z.number().nullable(),
      avaliacao: esquemaNivelAvaliacao.nullable(),
      comentarioAvaliacao: z.string().nullable(),
      /** Tem parte aberta preenchida (dá para avaliar). */
      temParteAberta: z.boolean(),
    }),
  ),
});
export type DetalheQuestao = z.infer<typeof esquemaDetalheQuestao>;

export const esquemaAluno = z.object({
  id: z.number(),
  usuario: z.string(),
  nome: z.string(),
  respondidas: z.number(),
  total: z.number(),
  ticket: z.number(),
  ultimoSalvamento: z.string().nullable(),
});
export type Aluno = z.infer<typeof esquemaAluno>;

// ------------------------------------------------------------------ exportar / importar

export const esquemaExport = z.object({
  formato: z.literal("atividade-aula03"),
  versao: z.literal(1),
  exportadoEm: z.string(),
  fase: esquemaFase,
  usuarios: z
    .array(
      z.object({
        id: z.number().int().positive(),
        usuario: z.string().min(1).max(20),
        senhaHash: z.string().min(1).max(100),
        nome: z.string().min(1).max(40),
        criadoEm: z.iso.datetime(),
        respostas: z
          .array(
            z.object({
              questaoId: z.string().max(10),
              valor: esquemaValor,
              marcacao: esquemaMarcacao.nullable(),
              correcao: z.string().max(LIMITE_TEXTO).nullable(),
              // Exports antigos não têm este campo e continuam importando.
              motivoErro: z.string().max(LIMITE_TEXTO).nullable().default(null),
              conferiu: z.boolean().nullable(),
              atualizadoEm: z.iso.datetime(),
            }),
          )
          .max(100),
        // Opcional: exports antigos (sem avaliações) continuam importando.
        avaliacoes: z
          .array(
            z.object({
              questaoId: z.string().max(10),
              avaliacao: esquemaNivelAvaliacao,
              comentario: z.string().max(LIMITE_COMENTARIO).nullable(),
              valorAvaliado: esquemaValor,
              avaliadoEm: z.iso.datetime(),
            }),
          )
          .max(100)
          .default([]),
      }),
    )
    .max(500),
});
export type Export = z.infer<typeof esquemaExport>;

// ------------------------------------------------------------------ avaliação das abertas

/** O que o GET /api/professor/avaliacoes devolve: tudo o que o Claude (ou o professor) precisa para avaliar. */
export const esquemaParaAvaliar = z.object({
  instrucoes: z.string(),
  total: z.number(),
  questoes: z.array(
    z.object({
      questaoId: z.string(),
      enunciado: z.string(),
      bloco: z.string().nullable(),
      /** Resposta esperada e erros comuns (gabarito comentado da aula_03.md). */
      referencia: z.string(),
      respostas: z.array(
        z.object({
          usuarioId: z.number(),
          versao: z.string(),
          /** A resposta inteira, campo a campo. "aberta" = parte que precisa de avaliação. */
          campos: z.array(z.object({ rotulo: z.string(), texto: z.string(), aberta: z.boolean() })),
          avaliacao: esquemaNivelAvaliacao.nullable(),
          comentario: z.string().nullable(),
        }),
      ),
    }),
  ),
});
export type ParaAvaliar = z.infer<typeof esquemaParaAvaliar>;

export const esquemaSalvarAvaliacoes = z.object({
  avaliacoes: z
    .array(
      z.object({
        usuarioId: z.number().int().positive(),
        questaoId: z.string().max(10),
        /** O "versao" que veio no GET. Se o aluno mudou a resposta depois, a avaliação é ignorada. */
        versao: z.string(),
        /** null apaga a avaliação. */
        avaliacao: esquemaNivelAvaliacao.nullable(),
        comentario: z.string().trim().max(LIMITE_COMENTARIO).nullable().optional(),
      }),
    )
    .min(1)
    .max(300),
});
export type SalvarAvaliacoes = z.infer<typeof esquemaSalvarAvaliacoes>;

export const esquemaResultadoAvaliacoes = z.object({
  salvas: z.number(),
  ignoradas: z.array(z.object({ usuarioId: z.number(), questaoId: z.string(), motivo: z.string() })),
});
