// As 27 questões de atividade_aluno.md + as 5 do ticket de saída (bloco 8 da aula_03.md).
// Este arquivo vai para o navegador: NÃO coloque respostas aqui (elas ficam em gabarito.ts).
//
// Texto dos enunciados: **negrito** e `código` funcionam; o resto é texto puro.
//
// Toda resposta é gravada como um objeto { chave: texto }. As chaves de cada questão
// saem de chavesDaQuestao(), e o servidor recusa qualquer outra.

export const MARCACOES = ["S", "C", "P", "?"] as const;
export type Marcacao = (typeof MARCACOES)[number];

export const ROTULO_MARCACAO: Record<Marcacao, string> = {
  S: "Sabia de cabeça",
  C: "Consultei o caderno",
  P: "Pesquisei na internet",
  "?": "Chutei / não sei",
};

/** Avaliação da parte aberta (feita pelo professor ou pelo Claude). */
export const AVALIACOES = ["certa", "parcial", "errada"] as const;
export type NivelAvaliacao = (typeof AVALIACOES)[number];
export const NOTA_AVALIACAO: Record<NivelAvaliacao, number> = { certa: 1, parcial: 0.5, errada: 0 };
export const ROTULO_AVALIACAO: Record<NivelAvaliacao, string> = {
  certa: "Certa",
  parcial: "Parcial",
  errada: "Errada",
};

export const FASES = ["atividade", "correcao", "ticket", "encerrada"] as const;
export type Fase = (typeof FASES)[number];

export const ROTULO_FASE: Record<Fase, string> = {
  atividade: "Atividade",
  correcao: "Correção",
  ticket: "Ticket de saída",
  encerrada: "Encerrada",
};

export type Parte = "A" | "B" | "C" | "D" | "E" | "T";

export const PARTES: { id: Parte; titulo: string }[] = [
  { id: "A", titulo: "Redes e Internet" },
  { id: "B", titulo: "UDP e TCP" },
  { id: "C", titulo: "HTTP" },
  { id: "D", titulo: "URLs e respostas" },
  { id: "E", titulo: "Para o professor" },
  { id: "T", titulo: "Ticket de saída" },
];

/** Um campo de texto. `curto` = campo de uma linha (lacuna); senão, caixa que cresce. */
export interface Campo {
  id: string;
  rotulo: string;
  curto?: boolean;
}

export interface Item {
  id: string;
  texto: string;
}

interface Base {
  id: string;
  parte: Parte;
  estrela?: boolean;
  /** Marcação S C P ? (a Parte E e o ticket não têm). */
  marcavel: boolean;
  /** Aparece na fase de correção (Partes A a D). */
  corrigivel: boolean;
  enunciado: string;
  /** Bloco de texto em fonte monoespaçada logo abaixo do enunciado (ex.: uma resposta HTTP). */
  bloco?: string;
}

/** Uma caixa de texto livre. Chave: "texto". */
export interface QuestaoTexto extends Base {
  tipo: "texto";
}

/** Vários campos de texto (ou lacunas, com `curto`). Chave: o id de cada campo. */
export interface QuestaoCampos extends Base {
  tipo: "campos";
  campos: Campo[];
}

/** Um conjunto de itens, cada um com uma opção. Chave: o id do item; `depois` são campos extras. */
export interface QuestaoClassificar extends Base {
  tipo: "classificar";
  pergunta: string;
  opcoes: string[];
  itens: Item[];
  depois?: { enunciado: string; campos: Campo[] };
}

/** Ordenar de 1 a N. Chave: o id do item → a posição ("1", "2"...). */
export interface QuestaoOrdenar extends Base {
  tipo: "ordenar";
  itens: Item[];
}

/** Tabela: cada linha tem uma célula por coluna. Chave: "linha.coluna". */
export interface QuestaoTabela extends Base {
  tipo: "tabela";
  colunas: Item[];
  linhas: (Item & { opcoes?: string[] })[];
}

/** Escolha + justificativa por item. Chaves: "item" e "item.porque". */
export interface QuestaoJustificar extends Base {
  tipo: "justificar";
  pergunta: string;
  opcoes: string[];
  rotuloJustificativa: string;
  itens: Item[];
}

/** Verdadeiro ou falso, com correção das falsas. Chaves: "item" (V/F) e "item.correcao". */
export interface QuestaoVF extends Base {
  tipo: "vf";
  itens: Item[];
}

export type Questao =
  QuestaoTexto | QuestaoCampos | QuestaoClassificar | QuestaoOrdenar | QuestaoTabela | QuestaoJustificar | QuestaoVF;

export type Valor = Record<string, string>;

const letras = (...textos: string[]): Item[] => textos.map((texto, i) => ({ id: String.fromCharCode(97 + i), texto }));

const atividade = { marcavel: true, corrigivel: true } as const;

export const QUESTOES: Questao[] = [
  // ---------------------------------------------------------------- PARTE A
  {
    id: "A1",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "texto",
    enunciado: "Com suas palavras: o que é uma rede de computadores? Cite uma rede que você usou hoje.",
  },
  {
    id: "A2",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "classificar",
    enunciado: "Escreva o tipo de rede (**PAN, LAN, WLAN, MAN** ou **WAN**) de cada situação:",
    pergunta: "Tipo de rede",
    opcoes: ["PAN", "LAN", "WLAN", "MAN", "WAN"],
    itens: letras(
      "O Wi-Fi da sua casa",
      "A Internet",
      "Um fone Bluetooth ligado ao celular",
      "Os computadores do laboratório ligados por cabo",
      "Uma rede que liga todas as escolas de uma prefeitura",
    ),
  },
  {
    id: "A3",
    parte: "A",
    ...atividade,
    tipo: "texto",
    enunciado:
      "Você está ouvindo música num fone Bluetooth, com o celular no Wi-Fi de casa. Aí você sai de casa e o celular passa a usar o 4G. Quais tipos de rede o celular usou nessa história?",
  },
  {
    id: "A4",
    parte: "A",
    ...atividade,
    tipo: "classificar",
    enunciado:
      "Infraestrutura de TI: classifique cada item como **Hardware**, **Software**, **Serviço** ou **Espaço**.",
    pergunta: "Classificação",
    opcoes: ["Hardware", "Software", "Serviço", "Espaço"],
    itens: letras(
      "Switch",
      "Windows",
      "Banco de dados MySQL",
      "E-mail da empresa",
      "Ar-condicionado da sala de servidores",
      "Roteador",
    ),
  },
  {
    id: "A5",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "classificar",
    enunciado: "Cada item é **cliente-servidor** ou **P2P**?",
    pergunta: "Cliente-servidor ou P2P?",
    opcoes: ["Cliente-servidor", "P2P"],
    itens: letras(
      "Netflix",
      "Torrent",
      "App do banco",
      "Site da escola",
      "Mandar um arquivo direto de um PC para outro PC",
    ),
    depois: {
      enunciado: "E responda:",
      campos: [
        { id: "servidor", rotulo: "No cliente-servidor, o que acontece se o **servidor** cair?" },
        { id: "p2p", rotulo: "E no P2P, o que acontece se **um** dos computadores desligar?" },
      ],
    },
  },
  {
    id: "A6",
    parte: "A",
    ...atividade,
    tipo: "texto",
    enunciado: "O que é um **ISP**? O que é o **backbone**? Qual é o ISP da sua casa ou do seu celular?",
  },
  {
    id: "A7",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "ordenar",
    enunciado:
      "Você digitou `www.site.com.br` no navegador. Coloque os passos na ordem em que acontecem (de **1 a 7**):",
    itens: letras(
      "O pedido viaja pelo backbone, passando por vários roteadores",
      "O navegador monta e mostra a página",
      "O DNS traduz o nome do site para um endereço IP",
      "O pedido sai do dispositivo e chega ao roteador de casa",
      "O servidor do site processa e envia a resposta",
      "Eu digito a URL no navegador",
      "O roteador envia o pedido para o ISP",
    ),
  },
  {
    id: "A8",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "texto",
    enunciado: 'O que o **DNS** faz? Por que ele é chamado de "agenda de contatos da Internet"?',
  },
  {
    id: "A9",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "campos",
    enunciado: "Complete as portas e a analogia do prédio:",
    campos: [
      { id: "http", rotulo: "HTTP =", curto: true },
      { id: "https", rotulo: "HTTPS =", curto: true },
      { id: "mysql", rotulo: "MySQL =", curto: true },
      { id: "ip", rotulo: "Na analogia do prédio, o **IP** é…", curto: true },
      { id: "porta", rotulo: "…e a **porta** é…", curto: true },
    ],
  },
  {
    id: "A10",
    parte: "A",
    estrela: true,
    ...atividade,
    tipo: "texto",
    enunciado:
      'Seu colega programou um site e fala: "Abre aí no seu computador: `http://localhost:3000`". Você vai ver o site **dele**? Por quê?',
  },
  {
    id: "A11",
    parte: "A",
    ...atividade,
    tipo: "campos",
    enunciado: "Explique com suas palavras:",
    campos: [
      { id: "a", rotulo: "a) Latência" },
      { id: "b", rotulo: "b) Deploy" },
      { id: "c", rotulo: "c) API" },
    ],
  },

  // ---------------------------------------------------------------- PARTE B
  {
    id: "B1",
    parte: "B",
    estrela: true,
    ...atividade,
    tipo: "tabela",
    enunciado: "Complete a tabela:",
    colunas: [
      { id: "udp", texto: "UDP" },
      { id: "tcp", texto: "TCP" },
    ],
    linhas: [
      { id: "conexao", texto: "Abre conexão antes de enviar?", opcoes: ["Sim", "Não"] },
      { id: "entrega", texto: "A entrega é garantida?", opcoes: ["Sim", "Não"] },
      { id: "ordem", texto: "Os dados chegam na ordem certa?", opcoes: ["Sim", "Não"] },
      { id: "exemplo", texto: "Um exemplo de uso" },
    ],
  },
  {
    id: "B2",
    parte: "B",
    estrela: true,
    ...atividade,
    tipo: "justificar",
    enunciado: "**UDP** ou **TCP**? Justifique em poucas palavras.",
    pergunta: "UDP ou TCP?",
    opcoes: ["UDP", "TCP"],
    rotuloJustificativa: "Por quê?",
    itens: letras(
      "Chamada de vídeo ao vivo",
      "Baixar um PDF",
      "Posição dos jogadores num jogo online",
      "Enviar o formulário de matrícula",
      "Uma consulta DNS",
    ),
  },
  {
    id: "B3",
    parte: "B",
    estrela: true,
    ...atividade,
    tipo: "justificar",
    enunciado:
      "O **three-way handshake** do TCP. Escolha **SYN**, **SYN-ACK** ou **ACK** para cada mensagem e escreva o que ela quer dizer:",
    pergunta: "Mensagem",
    opcoes: ["SYN", "SYN-ACK", "ACK"],
    rotuloJustificativa: "Significa",
    itens: [
      { id: "m1", texto: "1ª: Cliente ──► Servidor" },
      { id: "m2", texto: "2ª: Cliente ◄── Servidor" },
      { id: "m3", texto: "3ª: Cliente ──► Servidor" },
    ],
  },
  {
    id: "B4",
    parte: "B",
    ...atividade,
    tipo: "vf",
    enunciado: "Verdadeiro (**V**) ou Falso (**F**)? **Corrija** as falsas.",
    itens: letras(
      "O UDP é sempre mais rápido, por isso nunca deve ser usado para nada importante.",
      "O TCP reenvia os dados que se perderam no caminho.",
      "No UDP, os dados sempre chegam na mesma ordem em que foram enviados.",
      "O TCP abre uma conexão antes de começar a enviar os dados.",
      "A versão mais nova do HTTP (HTTP/3) usa UDP. (pode pesquisar)",
    ),
  },
  {
    id: "B5",
    parte: "B",
    ...atividade,
    tipo: "texto",
    enunciado:
      'Numa chamada de vídeo, a fala da pessoa "pulou" um pedaço, em vez de a chamada travar esperando. Por que, nesse tipo de aplicação, é melhor **perder** um pedaço do que **esperar** ele ser reenviado?',
  },

  // ---------------------------------------------------------------- PARTE C
  {
    id: "C1",
    parte: "C",
    estrela: true,
    ...atividade,
    tipo: "texto",
    enunciado: "O que é o **HTTP**? Numa comunicação HTTP, quem faz a **requisição** e quem envia a **resposta**?",
  },
  {
    id: "C2",
    parte: "C",
    ...atividade,
    tipo: "texto",
    enunciado:
      "Qual a diferença entre **HTTP** e **HTTPS**? (Pense na porta, no que aparece no navegador e na segurança.)",
  },
  {
    id: "C3",
    parte: "C",
    ...atividade,
    tipo: "texto",
    enunciado:
      'O HTTP é **stateless** ("sem estado"): o servidor não lembra das requisições anteriores. Se é assim, como o site sabe que você continua logado a cada clique? (pode pesquisar)',
  },
  {
    id: "C4",
    parte: "C",
    estrela: true,
    ...atividade,
    tipo: "classificar",
    enunciado: "Qual **método HTTP** usar?",
    pergunta: "Método",
    opcoes: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    itens: letras(
      "Ver a lista de produtos",
      "Cadastrar um aluno novo",
      "Mudar **só** o telefone de um aluno",
      "Apagar um comentário",
      "Substituir o cadastro **inteiro** de um aluno",
    ),
  },
  {
    id: "C5",
    parte: "C",
    estrela: true,
    ...atividade,
    tipo: "campos",
    enunciado: "O primeiro dígito do código de status diz o tipo da resposta. Complete:",
    campos: [
      { id: "2xx", rotulo: "2xx =", curto: true },
      { id: "3xx", rotulo: "3xx =", curto: true },
      { id: "4xx", rotulo: "4xx =", curto: true },
      { id: "5xx", rotulo: "5xx =", curto: true },
    ],
  },
  {
    id: "C6",
    parte: "C",
    estrela: true,
    ...atividade,
    tipo: "classificar",
    enunciado: "Qual **código de status** o servidor deve devolver?",
    pergunta: "Código",
    opcoes: ["200", "201", "204", "400", "401", "403", "404", "409", "429", "500", "503"],
    itens: letras(
      "Pedi o produto `/api/produtos/99999`, que não existe",
      "Tentei ver meu perfil sem fazer login",
      "Fiz login como aluno e tentei entrar na área do administrador",
      "Mandei um JSON com uma vírgula faltando",
      "Tem um bug no código do servidor",
      "Tentei me cadastrar com um e-mail que já existe",
      "Fiz 500 requisições em 1 segundo",
      "O servidor está em manutenção",
      "Cadastrei um produto novo e deu certo",
      "Apaguei um produto, deu certo e não há nada para mostrar",
    ),
  },
  {
    id: "C7",
    parte: "C",
    estrela: true,
    ...atividade,
    tipo: "campos",
    enunciado:
      "Para cada situação, diga **onde está o problema** (no pedido, no servidor ou na rede) e **o que você faria**:",
    campos: [
      { id: "a", rotulo: 'a) O app mostra **"Erro 400"**' },
      { id: "b", rotulo: 'b) O app mostra **"Erro 503"**' },
      { id: "c", rotulo: 'c) O navegador mostra **"Não foi possível acessar o site"** e não aparece código nenhum' },
    ],
  },

  // ---------------------------------------------------------------- PARTE D
  {
    id: "D1",
    parte: "D",
    ...atividade,
    tipo: "campos",
    enunciado: "Separe as partes desta URL: `https://bolsa.fly.dev/api/batatas?setor=doce&precoMax=10`",
    campos: [
      { id: "protocolo", rotulo: "Protocolo", curto: true },
      { id: "dominio", rotulo: "Domínio", curto: true },
      { id: "caminho", rotulo: "Caminho", curto: true },
      { id: "query", rotulo: "Query string", curto: true },
      { id: "muda", rotulo: "O que muda na resposta se eu trocar `setor=doce` por `setor=gourmet`?" },
    ],
  },
  {
    id: "D2",
    parte: "D",
    ...atividade,
    tipo: "campos",
    enunciado: "Uma colega mandou um `POST /api/batatas` e recebeu esta resposta:",
    bloco: `HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": 400,
  "erro": "JSON inválido",
  "mensagem": "O corpo da requisição não é um JSON válido.",
  "dica": "Confira as aspas duplas, as vírgulas e as chaves."
}`,
    campos: [
      { id: "a", rotulo: "a) Deu certo ou deu erro? Como você sabe?" },
      { id: "b", rotulo: "b) O problema está no pedido dela ou no servidor?" },
      { id: "c", rotulo: "c) O que ela deve fazer para resolver?" },
    ],
  },

  // ---------------------------------------------------------------- PARTE E
  {
    id: "E1",
    parte: "E",
    marcavel: false,
    corrigivel: false,
    tipo: "texto",
    enunciado: "Em qual assunto você se sente **mais seguro**? E **menos seguro**?",
  },
  {
    id: "E2",
    parte: "E",
    marcavel: false,
    corrigivel: false,
    tipo: "texto",
    enunciado: "Que parte da aula 02 ficou mais confusa? O que você gostaria que fosse explicado de novo?",
  },

  // ------------------------------------------------- TICKET DE SAÍDA (sem consulta)
  {
    id: "T1",
    parte: "T",
    marcavel: false,
    corrigivel: false,
    tipo: "campos",
    enunciado: "Um fone Bluetooth ligado ao celular é que tipo de rede?",
    campos: [{ id: "rede", rotulo: "Tipo de rede", curto: true }],
  },
  {
    id: "T2",
    parte: "T",
    marcavel: false,
    corrigivel: false,
    tipo: "texto",
    enunciado: "Acessei `http://localhost:8080`. Estou acessando qual computador?",
  },
  {
    id: "T3",
    parte: "T",
    marcavel: false,
    corrigivel: false,
    tipo: "justificar",
    enunciado: "Assistir a uma live: **UDP** ou **TCP**? Por quê?",
    pergunta: "UDP ou TCP?",
    opcoes: ["UDP", "TCP"],
    rotuloJustificativa: "Por quê?",
    itens: [{ id: "live", texto: "Assistir a uma live" }],
  },
  {
    id: "T4",
    parte: "T",
    marcavel: false,
    corrigivel: false,
    tipo: "campos",
    enunciado: "Fiz login, mas não sou administrador e tentei entrar na área do administrador. Qual código de status?",
    campos: [{ id: "codigo", rotulo: "Código", curto: true }],
  },
  {
    id: "T5",
    parte: "T",
    marcavel: false,
    corrigivel: false,
    tipo: "campos",
    enunciado: "Quero mudar **só** o preço do produto 7. Qual método e qual URL?",
    campos: [
      { id: "metodo", rotulo: "Método", curto: true },
      { id: "url", rotulo: "URL", curto: true },
    ],
  },
];

export const QUESTOES_POR_ID = new Map(QUESTOES.map((q) => [q.id, q]));

export const questoesDaParte = (parte: Parte) => QUESTOES.filter((q) => q.parte === parte);

/** Questões da atividade (A a E), sem o ticket. */
export const QUESTOES_ATIVIDADE = QUESTOES.filter((q) => q.parte !== "T");
export const QUESTOES_TICKET = QUESTOES.filter((q) => q.parte === "T");

/** As chaves que a resposta desta questão pode ter. */
export function chavesDaQuestao(q: Questao): string[] {
  switch (q.tipo) {
    case "texto":
      return ["texto"];
    case "campos":
      return q.campos.map((c) => c.id);
    case "classificar":
      return [...q.itens.map((i) => i.id), ...(q.depois?.campos.map((c) => c.id) ?? [])];
    case "ordenar":
      return q.itens.map((i) => i.id);
    case "tabela":
      return q.linhas.flatMap((l) => q.colunas.map((c) => `${l.id}.${c.id}`));
    case "justificar":
      return q.itens.flatMap((i) => [i.id, `${i.id}.porque`]);
    case "vf":
      return q.itens.flatMap((i) => [i.id, `${i.id}.correcao`]);
  }
}

/** Valores permitidos para uma chave de escolha (ou undefined, se a chave é texto livre). */
export function opcoesDaChave(q: Questao, chave: string): string[] | undefined {
  switch (q.tipo) {
    case "classificar":
      return q.itens.some((i) => i.id === chave) ? q.opcoes : undefined;
    case "ordenar":
      return q.itens.map((_, i) => String(i + 1));
    case "tabela": {
      const linha = q.linhas.find((l) => chave.startsWith(`${l.id}.`));
      return linha?.opcoes;
    }
    case "justificar":
      return chave.includes(".") ? undefined : q.opcoes;
    case "vf":
      return chave.includes(".") ? undefined : ["V", "F"];
    default:
      return undefined;
  }
}

/** Rótulo curto de uma chave, para o painel e o CSV ("a) O Wi-Fi da sua casa", "UDP · Abre conexão…"). */
export function rotuloDaChave(q: Questao, chave: string): string {
  const semMarkdown = (t: string) => t.replace(/\*\*|`/g, "");
  switch (q.tipo) {
    case "texto":
      return "Resposta";
    case "campos":
      return semMarkdown(q.campos.find((c) => c.id === chave)?.rotulo ?? chave);
    case "classificar": {
      const item = q.itens.find((i) => i.id === chave);
      if (item) return `${item.id}) ${semMarkdown(item.texto)}`;
      return semMarkdown(q.depois?.campos.find((c) => c.id === chave)?.rotulo ?? chave);
    }
    case "ordenar": {
      const item = q.itens.find((i) => i.id === chave);
      return item ? semMarkdown(item.texto) : chave;
    }
    case "tabela": {
      const [l, c] = chave.split(".");
      const linha = q.linhas.find((x) => x.id === l);
      const coluna = q.colunas.find((x) => x.id === c);
      return `${coluna?.texto ?? c} · ${linha?.texto ?? l}`;
    }
    case "justificar":
    case "vf": {
      const [i, sufixo] = chave.split(".");
      const item = q.itens.find((x) => x.id === i);
      const base = item ? (q.tipo === "vf" ? `${item.id}) ` : "") + semMarkdown(item.texto) : i;
      if (!sufixo) return base;
      return `${base} — ${q.tipo === "vf" ? "correção" : q.rotuloJustificativa.toLowerCase()}`;
    }
  }
}

/** A resposta tem pelo menos um campo preenchido? */
export const respondida = (valor: Valor | undefined) => !!valor && Object.values(valor).some((v) => v.trim() !== "");
