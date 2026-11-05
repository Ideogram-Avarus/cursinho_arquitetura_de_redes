// Respostas das partes FECHADAS (as que dá para corrigir sozinho). SÓ o servidor importa este arquivo:
// ele nunca vai para o navegador. Fonte: "Gabarito comentado" da aula_03.md.
//
// O acerto não é gravado no banco: ele é calculado na hora a partir daqui.
// Se você ajustar o gabarito, o painel e o export se recalculam sozinhos.
//
// Cada chave aceita uma lista de respostas. Texto digitado é comparado sem diferenciar
// maiúsculas, acentos e espaços nas pontas (veja normalizar()).

type Aceitas = (string | RegExp)[];
export type GabaritoDaQuestao = Record<string, Aceitas>;

export const GABARITO: Record<string, GabaritoDaQuestao> = {
  // WLAN é o mais certo para o Wi-Fi, mas a aula aceita LAN.
  A2: { a: ["WLAN", "LAN"], b: ["WAN"], c: ["PAN"], d: ["LAN"], e: ["MAN"] },
  A4: { a: ["Hardware"], b: ["Software"], c: ["Software"], d: ["Serviço"], e: ["Espaço"], f: ["Hardware"] },
  A5: { a: ["Cliente-servidor"], b: ["P2P"], c: ["Cliente-servidor"], d: ["Cliente-servidor"], e: ["P2P"] },
  // Ordem na folha: 5 – 7 – 2 – 3 – 6 – 1 – 4
  A7: { a: ["5"], b: ["7"], c: ["2"], d: ["3"], e: ["6"], f: ["1"], g: ["4"] },
  A9: { http: ["80"], https: ["443"], mysql: ["3306"] },
  B1: {
    "conexao.udp": ["Não"],
    "conexao.tcp": ["Sim"],
    "entrega.udp": ["Não"],
    "entrega.tcp": ["Sim"],
    "ordem.udp": ["Não"],
    "ordem.tcp": ["Sim"],
  },
  B2: { a: ["UDP"], b: ["TCP"], c: ["UDP"], d: ["TCP"], e: ["UDP"] },
  B3: { m1: ["SYN"], m2: ["SYN-ACK"], m3: ["ACK"] },
  B4: { a: ["F"], b: ["V"], c: ["F"], d: ["V"], e: ["V"] },
  C4: { a: ["GET"], b: ["POST"], c: ["PATCH"], d: ["DELETE"], e: ["PUT"] },
  C6: {
    a: ["404"],
    b: ["401"],
    c: ["403"],
    d: ["400"],
    e: ["500"],
    f: ["409"],
    g: ["429"],
    h: ["503"],
    i: ["201"],
    j: ["204"],
  },
  D1: {
    protocolo: [/^https(:\/\/)?$/],
    dominio: ["bolsa.fly.dev"],
    caminho: [/^\/?api\/batatas\/?$/],
    query: [/^\??setor=doce&precomax=10$/],
  },
  // Ticket de saída
  T1: { rede: ["PAN"] },
  T3: { live: ["UDP"] },
  T4: { codigo: ["403"] },
  T5: { metodo: ["PATCH"], url: [/(^|\/)api\/produtos\/7\/?$/] },
};

/** Minúsculo, sem acento, sem espaços nas pontas nem em volta de "=", "&" e "/". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s*([=&/?:])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/[.;,]+$/, "");
}

export function confere(resposta: string | undefined, aceitas: Aceitas): boolean {
  if (!resposta || resposta.trim() === "") return false;
  const r = normalizar(resposta);
  return aceitas.some((a) => (typeof a === "string" ? normalizar(a) === r : a.test(r)));
}

/** Como mostrar para o aluno as respostas que o gabarito guarda como expressão regular. */
const TEXTO_DAS_EXPRESSOES: Record<string, string> = {
  "D1.protocolo": "https",
  "D1.caminho": "/api/batatas",
  "D1.query": "?setor=doce&precoMax=10",
  "T5.url": "/api/produtos/7",
};

/** A resposta certa de uma parte fechada, em texto para o aluno ler. */
export function textoDaResposta(questaoId: string, chave: string): string {
  const aceitas = GABARITO[questaoId]?.[chave] ?? [];
  return aceitas.map((a) => (typeof a === "string" ? a : TEXTO_DAS_EXPRESSOES[`${questaoId}.${chave}`])).join(" ou ");
}

export interface Correcao {
  /** Quantas partes fechadas estão certas. */
  certas: number;
  /** Quantas partes fechadas a questão tem. */
  total: number;
  /** Chave → acertou? (só as fechadas) */
  porChave: Record<string, boolean>;
}

/** Corrige as partes fechadas. Devolve null se a questão não tem parte fechada. */
export function corrigir(questaoId: string, valor: Record<string, string>): Correcao | null {
  const gabarito = GABARITO[questaoId];
  if (!gabarito) return null;
  const porChave: Record<string, boolean> = {};
  for (const [chave, aceitas] of Object.entries(gabarito)) {
    porChave[chave] = confere(valor[chave], aceitas);
  }
  const certas = Object.values(porChave).filter(Boolean).length;
  return { certas, total: Object.keys(gabarito).length, porChave };
}

// ------------------------------------------------------------------ partes ABERTAS
// Resposta esperada de cada parte aberta, tirada do "Gabarito comentado" da aula_03.md.
// A Parte E não entra: não tem resposta certa.

/** O que o aluno lê na fase de correção. Aqui não entra critério de avaliação. */
export const RESPOSTAS_ESPERADAS: Record<string, string> = {
  A1: "Dois ou mais dispositivos ligados entre si para TROCAR DADOS e COMPARTILHAR RECURSOS. Exemplos: Wi-Fi de casa, rede do celular, rede da escola.",
  A3: "PAN (Bluetooth) + WLAN (Wi-Fi) em casa; depois PAN + WAN (4G). O celular usa várias redes AO MESMO TEMPO.",
  A5: "No cliente-servidor, se o servidor cai, NINGUÉM consegue usar; no P2P, se um computador desliga, os outros CONTINUAM funcionando.",
  A6: "ISP = a empresa que conecta você à Internet (Vivo, Claro, TIM, provedor de fibra do bairro). Backbone = as grandes 'rodovias' da Internet: cabos de fibra de altíssima velocidade ligando cidades, países e continentes.",
  A8: "Traduz o NOME do site (www.site.com.br) para o ENDEREÇO IP (ex.: 200.150.10.5). É uma 'agenda' porque, como na agenda do celular, você procura pelo nome e ela te dá o número.",
  A9: "Analogia do prédio: o IP é o ENDEREÇO DO PRÉDIO; a porta é o NÚMERO DO APARTAMENTO (cada programa 'mora' numa porta).",
  A10: "NÃO. localhost (127.0.0.1) é sempre O PRÓPRIO computador. No seu PC, localhost:3000 procura um programa rodando na SUA máquina; o site do colega está na máquina dele, então você vê um erro de conexão (ou outro programa seu). Para ver o site do colega precisaria do IP da máquina dele.",
  A11: "a) Latência: tempo que o dado leva para ir e voltar (em ms); latência alta = sistema 'lento'. b) Deploy: colocar o sistema no ar, num servidor, para outras pessoas acessarem. c) API: o jeito de um programa conversar com outro pela rede (o app pede dados, o servidor responde).",
  B1: "Exemplos de uso: UDP → DNS, chamada de vídeo, jogo online, live, HTTP/3. TCP → sites, APIs, e-mail, banco de dados, download, formulários.",
  B2: "Justificativas: a) UDP: é ao vivo, esperar o pedaço perdido atrasaria a conversa • b) TCP: não pode faltar nenhum pedaço • c) UDP: a posição de 1 segundo atrás já não serve • d) TCP: os dados precisam chegar completos e certos • e) UDP: pergunta pequena e rápida (se perder, pergunta de novo).",
  B3: "Significados: SYN = 'quero conectar' (e manda o número de sequência inicial); SYN-ACK = 'recebi seu pedido, e eu também quero conectar'; ACK = 'confirmado', a partir daqui vão os dados.",
  B4: "Correção das falsas: a) F: o UDP não é sempre mais rápido nem inútil; o DNS usa UDP, e quando precisa de garantia a própria aplicação cuida disso • c) F: no UDP os dados PODEM chegar fora de ordem. (b, d, e são V e não precisam de correção.)",
  B5: "Porque é AO VIVO: o pedaço perdido, quando chegasse, já estaria atrasado e não serviria mais. Esperar faria a chamada travar para todo mundo. Melhor seguir com o que está acontecendo agora.",
  C1: "HyperText Transfer Protocol: o protocolo (as 'regras da conversa') que sites, apps e APIs usam para trocar dados. O CLIENTE (navegador, app) faz a requisição; o SERVIDOR envia a resposta.",
  C2: "HTTP usa a porta 80 e manda tudo em texto aberto (quem estiver no caminho pode ler). HTTPS usa a porta 443, os dados vão CRIPTOGRAFADOS, e o navegador mostra o CADEADO.",
  C3: "Em TODA requisição o navegador manda junto uma identificação: um COOKIE ou um TOKEN (que o servidor entregou no login). Assim o servidor 'reconhece' você sem precisar lembrar.",
  C5: "2xx = sucesso • 3xx = redirecionamento • 4xx = erro do cliente (o pedido está errado) • 5xx = erro do servidor.",
  C7: "a) 400: problema no PEDIDO (dado faltando, JSON quebrado); revisar o que foi enviado • b) 503: problema no SERVIDOR (fora do ar, manutenção, sobrecarga); mudar o pedido não resolve, esperar e tentar depois • c) sem código: a resposta nem chegou, problema de REDE; conferir internet, endereço (DNS) e se o servidor está ligado.",
  D1: "Trocando para gourmet, a lista passa a mostrar as batatas do setor gourmet (com preço até 10). O recurso é o mesmo, o FILTRO é que muda.",
  D2: "a) Deu ERRO: o código é 400 (4xx) e o corpo diz 'JSON inválido' • b) No PEDIDO dela (4xx = erro do cliente) • c) Corrigir o JSON do corpo: conferir aspas duplas, vírgulas e chaves, como diz a dica.",
  T2: "O SEU próprio computador (localhost = 127.0.0.1 = a própria máquina).",
  T3: "É ao vivo, não vale a pena esperar o pedaço perdido ser reenviado.",
};

/** Só para quem avalia (o Claude ou o professor): o aluno não vê. */
const CRITERIOS: Record<string, string> = {
  A1: "Erro comum: responder só 'é a internet' (a Internet é UMA rede, a maior, não a definição de rede).",
  A3: "Parcial: acertar só parte das redes ou não perceber que o Bluetooth continua junto.",
  A6: "O ISP de casa/celular é pessoal: qualquer provedor real vale.",
  A10: "É o erro mais importante da folha: responder 'sim' é errada.",
  A11: "Parcial: acertar 1 ou 2 dos 3.",
  B2: "Erro comum: justificar só com 'é mais rápido' sem falar de PERDA e ORDEM (no máximo parcial).",
  C1: "Parcial: definir HTTP sem dizer quem pede e quem responde (ou o contrário).",
  C2: "Não cobrar como a criptografia funciona. Parcial: só um ou dois desses pontos.",
  C3: "Aceite qualquer resposta que fale de cookie, sessão ou token.",
  C5: "Parcial: acertar 2 ou 3 dos 4.",
  C7: "Erro comum: achar que 'não foi possível acessar' é um 404 (o 404 é uma resposta do servidor).",
};

/** Resposta esperada + critérios: é o que o Claude (ou o professor) usa para avaliar em certa / parcial / errada. */
export const REFERENCIAS: Record<string, string> = Object.fromEntries(
  Object.entries(RESPOSTAS_ESPERADAS).map(([id, resposta]) => [
    id,
    [resposta, CRITERIOS[id]].filter(Boolean).join(" "),
  ]),
);

export const INSTRUCOES_AVALIACAO =
  "Avalie só as partes marcadas como 'aberta' (as fechadas já são corrigidas automaticamente), comparando com a 'referencia'. " +
  "certa = tem a ideia principal da referência, mesmo com outras palavras ou erros de português; " +
  "parcial = tem parte da ideia, ou falta um dos itens pedidos; " +
  "errada = ideia errada, vazia, sem relação, ou só copia a pergunta. " +
  "Não exija termos técnicos nem a resposta completa da referência: é uma atividade diagnóstica, não prova. " +
  "comentario: uma frase curta em português, escrita PARA O ALUNO (ele lê na fase de correção), dizendo com gentileza o que faltou ou o equívoco (vazio se estiver certa).";
