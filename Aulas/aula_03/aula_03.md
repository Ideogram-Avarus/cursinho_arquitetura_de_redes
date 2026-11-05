# Aula 03 — Atividade de diagnóstico + Revisão (aulas 01 e 02)
### Plano do professor

**Como usar este arquivo**
- A folha dos alunos está em `atividade_aluno.pdf` (imprimir uma por aluno; a fonte editável é `atividade_aluno.html`, e `atividade_aluno.md` é a versão em texto). Este arquivo é **só do professor**: tem o roteiro, os quadros de revisão e o **gabarito comentado**.
- Mesmo formato das aulas anteriores: o que está nas caixas de código vai **para o quadro**; as linhas com 🗣️ são **falas e dicas do professor**.
- **Fora da atividade, de propósito:** modelos OSI e TCP/IP, criptografia (chave pública/privada, TLS) e o funcionamento do QUIC, porque não foram dados. A única menção é "o HTTP/3 usa UDP" (B4-e), como questão de pesquisa.
- **Ideia central:** a 1ª metade mostra **o que ficou**; a 2ª metade revisa **o que não ficou**, na ordem que a turma apontar.

| Bloco | Tema | Horário previsto |
|:---:|---|:---:|
| 1 | Abertura e combinados | 0h00–0h10 |
| 2 | Atividade (folha do aluno) | 0h10–1h40 |
| 3 | Termômetro da turma | 1h40–2h00 |
| — | Intervalo | 2h00–2h15 |
| 4 | Resultado do termômetro e regras da correção | 2h15–2h20 |
| 5 | Revisão R1: redes e Internet | 2h20–2h45 |
| 6 | Revisão R2: UDP × TCP | 2h45–3h05 |
| 7 | Revisão R3: HTTP, métodos e códigos | 3h05–3h35 |
| 8 | Ticket de saída (sem consulta) | 3h35–3h50 |
| 9 | Fechamento | 3h50–4h00 |

---

## Antes da aula

- [ ] **Site da atividade** (`atividade_online/`, veja o `README.md` de lá): rodar `.\scripts\subir-aula.ps1` antes da aula e abrir o painel em `/professor`. Com o site, os alunos respondem no celular ou no PC, e o termômetro, a correção e o ticket acontecem lá, pelas fases do painel.
- [ ] Imprimir `atividade_aluno.pdf`, uma por aluno: são 3 páginas (frente e verso = 2 folhas por aluno). Com o site no ar, imprima só algumas, para o **plano B** (rede da escola caiu).
- [ ] Separar **canetas de outra cor** (vermelha ou verde) para a correção, ou pedir na aula anterior que tragam.
- [ ] **Parte D não usa a API** (o servidor da Bolsa de Batatas não vai estar no ar): as duas questões são só de leitura de URL e de resposta.
- [ ] Imprimir ou escrever o **ticket de saída** (bloco 8): meia folha por aluno.
- [ ] Desenhar no canto do quadro a **grade do termômetro** (bloco 3) antes de começar, para não perder tempo depois. (Só no plano B: com o site, o termômetro é automático.)

---

## BLOCO 1 — Abertura e combinados (0h00–0h10)

```
HOJE: ATIVIDADE + REVISÃO DAS AULAS 01 E 02

 1ª PARTE → atividade (NÃO é prova, NÃO vale nota)
 2ª PARTE → revisão do que vocês mais tiveram dúvida

 PODE: caderno, colinha, internet, conversar com o colega
 MAS:  escreva com as SUAS palavras

 Marque em CADA questão como respondeu:
  [S] sabia   [C] caderno   [P] pesquisei   [?] não sei / chutei

 Comece pelas ⭐ → depois as outras
 Use CANETA AZUL/PRETA agora. A outra cor é só para a correção.
```

🗣️ **Fala de abertura (sugestão):** "A aula passada teve muita coisa, e eu quero saber o que ficou claro e o que eu preciso explicar de novo. Isso aqui não vale nota. Se vocês marcarem tudo como 'sabia' e não souberem, quem perde são vocês, porque eu não vou revisar o que vocês precisam. Marcar [?] me ajuda muito."

🗣️ **Por que a marcação [S][C][P][?] importa:** ela separa o que a turma **absorveu** (S) do que só **anotou** (C) e do que **não ficou** (P e ?). Uma resposta certa marcada com [P] ainda é um assunto para revisar.

---

## BLOCO 2 — Atividade (0h10–1h40)

**Formato:** individual, com consulta. Pode conversar, mas cada um preenche a sua folha.

**Metas de tempo** (escreva no quadro e avise em voz alta):

```
 0h10 → começar a Parte A
 0h45 → estar na Parte B
 1h05 → estar na Parte C
 1h25 → Partes D e E
 1h40 → fim, mesmo quem não terminou
```

**O que o professor faz enquanto eles respondem:**
- 🗣️ **Não dê a resposta.** Devolva com uma pergunta: "Em que parte do caderno isso está?", "Que exemplo eu dei na aula?", "Pesquisa e me mostra o que achou".
- 🗣️ **Anote as dúvidas que você ouvir** num papel: são a pauta da revisão, junto com o termômetro.
- 🗣️ **Fique de olho na Parte E.** Quem termina rápido costuma pular a E; lembre que ela é a mais importante para você.
- 🗣️ **Quem terminar cedo:** revisa as questões sem ⭐ que pulou, ou ajuda um colega sem dar a resposta, só apontando onde está no caderno. (Os desafios bônus da prática dependem da API, que não vai estar no ar.)

---

## BLOCO 3 — Termômetro da turma (1h40–2h00)

> **Com o site:** o termômetro é automático. Em `/professor`, as questões já aparecem da mais difícil para a mais fácil (marcações P + ? e o erro nas partes fechadas), e clicar numa questão mostra as respostas **sem nome**, para projetar. Use os 20 minutos para a rodada rápida abaixo e para **exportar o JSON** em `/professor/dados`. A grade no quadro fica para o plano B (folha impressa).

Uma forma rápida de ver, **antes do intervalo**, quais questões a turma mais sentiu. Não dá para ler 30 folhas em 15 minutos, mas o termômetro dá para ler.

```
TERMÔMETRO → marque um traço ( | ) nas 3 questões
              em que você se sentiu MENOS seguro

 A1 ___  A2 ___  A3 ___  A4 ___  A5 ___  A6 ___
 A7 ___  A8 ___  A9 ___  A10 __  A11 __
 B1 ___  B2 ___  B3 ___  B4 ___  B5 ___
 C1 ___  C2 ___  C3 ___  C4 ___  C5 ___  C6 ___  C7 ___
 D1 ___  D2 ___
```

🗣️ Chame por fileira para não virar fila no quadro. Leva uns 8 minutos.

🗣️ **Rodada rápida (até 2h00):** "Teve alguma questão que vocês acharam que tinha **duas** respostas certas?" Essas costumam ser as mais interessantes de corrigir.

🗣️ **Os alunos ficam com a folha.** Ela vai ser corrigida por eles na revisão e entregue no fim da aula.

---

## — INTERVALO (2h00–2h15) —

> **Com o site:** logo no começo do intervalo, rode `/corrigir-aula03 <URL do site>` no Claude Code (veja `atividade_online/README.md`). Ele avalia as respostas escritas e termina com os erros mais comuns, que somam ao termômetro do painel.

🗣️ **Tarefa do professor no intervalo (5 min):** olhe o termômetro e circule as **5 questões com mais traços**. Somando com as dúvidas que você anotou no bloco 2, decida:
- quais blocos de revisão (R1, R2, R3) ganham **mais** tempo;
- quais questões vão ser **só lidas** (gabarito rápido, ninguém marcou).

Os tempos da tabela são um ponto de partida: se a turma foi bem em redes e mal em HTTP, tire tempo do R1 e dê ao R3.

---

## BLOCO 4 — Resultado e regras da correção (2h15–2h20)

> **Com o site:** mude a fase para **Correção** no painel. As respostas travam, e cada questão ganha os botões "Acertei" e "Corrigir", com um campo em outra cor (a "caneta vermelha" do site). As regras abaixo continuam valendo para quem estiver na folha impressa.

```
CORREÇÃO
 • Corrija com a CANETA DE OUTRA COR
 • NÃO apague o que você escreveu: risque e escreva do lado
 • Acertou? Faça um ✔. Errou ou faltou? Complete com a outra cor
 • No fim da aula a folha é ENTREGUE
```

🗣️ Mostre as questões circuladas do termômetro: "Foi aqui que vocês mais tiveram dúvida, então é aqui que a gente vai demorar mais."

🗣️ **Por que a caneta de outra cor:** quando as folhas chegarem na sua mão, você vê o "antes" (azul) e o "depois" (vermelho) de cada aluno. Isso é o diagnóstico de verdade.

**Dinâmica de cada questão na correção (para a revisão não ficar bagunçada):**
1. **Pergunte para quem marcou [S]** e peça para ler a resposta em voz alta.
2. **A turma concorda?** Alguém escreveu diferente?
3. **O professor fecha** com o quadro de revisão (R1, R2 ou R3) e o gabarito.
4. **Questões que ninguém marcou no termômetro:** só leia a resposta e siga em frente.

🗣️ **Um quadro por vez.** Escreva o quadro de revisão do bloco, corrija as questões desse bloco, apague, e só então passe para o próximo. Não pule entre assuntos.

---

## BLOCO 5 — Revisão R1: redes e Internet (2h20–2h45)

Corrige: **A1 a A11** e **D1**.

```
R1 — REDES E INTERNET

 REDE = dispositivos ligados para TROCAR DADOS e COMPARTILHAR RECURSOS

 TAMANHO:  PAN  <  LAN  <  MAN  <  WAN
           fone    lab/casa  cidade   Internet
           (WLAN = LAN sem fio = Wi-Fi)

 ORGANIZAÇÃO
  CLIENTE-SERVIDOR → um central responde todos  → servidor caiu, parou tudo
  P2P              → todos são cliente E servidor → um caiu, o resto segue

 O CAMINHO DE UMA URL
  digito → DNS (nome → IP) → roteador → ISP → backbone → servidor
         → resposta volta → navegador mostra

 IP = endereço do PRÉDIO   |   PORTA = número do APARTAMENTO
  80 HTTP • 443 HTTPS • 3306 MySQL
 LOCALHOST (127.0.0.1) = o PRÓPRIO computador

 URL: https:// bolsa.fly.dev /api/batatas ?setor=doce&precoMax=10
      protocolo  domínio      caminho      query string (chave=valor & ...)
```

🗣️ **Pontos que costumam dar erro (dê ênfase):**
- **A3:** o celular usa **várias redes ao mesmo tempo** (PAN + WLAN, depois PAN + WAN).
- **A10, localhost:** é o erro mais comum e o mais importante para quem programa. `localhost` é sempre **a sua** máquina; para ver o site do colega, você precisaria do **IP** da máquina dele na rede (gancho para a aula de IP).
- **A7:** muitos colocam o DNS depois do roteador. Explique que o DNS vem **antes**: sem o IP, o computador nem sabe para onde mandar o pedido. (A consulta ao DNS também passa pelo roteador, mas não precisa entrar nesse detalhe.)

---

## BLOCO 6 — Revisão R2: UDP × TCP (2h45–3h05)

Corrige: **B1 a B5**.

```
R2 — UDP × TCP  (levam os dados até o PROGRAMA certo, pela PORTA)

              │ UDP                    │ TCP
 ─────────────┼────────────────────────┼────────────────────────
 Conexão      │ NÃO abre, só envia     │ ABRE antes (handshake)
 Entrega      │ NÃO garantida          │ GARANTIDA (confirma e reenvia)
 Ordem        │ pode chegar fora       │ chega na ordem certa
 Bom para     │ o que é AO VIVO:       │ o que NÃO PODE FALTAR:
              │ chamada, live, jogo,   │ sites, APIs, arquivos,
              │ DNS                    │ formulários, e-mail

 HANDSHAKE (3 etapas)
  Cliente ── SYN ─────► Servidor   "quero conectar"
  Cliente ◄── SYN-ACK ─ Servidor   "recebi, e eu também quero"
  Cliente ── ACK ─────► Servidor   "confirmado!" → agora vão os dados

 PERGUNTA-CHAVE: "se um pedaço se perder, vale a pena ESPERAR ele voltar?"
  não → UDP        sim → TCP
```

🗣️ **A pergunta-chave é a ferramenta da revisão.** Use-a em cada item da B2: "Se perder um pedaço do PDF, dá para abrir o PDF?" (não → TCP). "Se perder meio segundo da chamada, vale travar a conversa para esperar?" (não → UDP).

🗣️ **B4-a, o mito:** UDP não é "inútil para coisas importantes". O DNS é importantíssimo e usa UDP. E o HTTP/3 usa UDP, só que ele mesmo cuida de confirmar e reenviar (não precisa explicar como; o QUIC fica para depois).

---

## BLOCO 7 — Revisão R3: HTTP, métodos e códigos (3h05–3h35)

Corrige: **C1 a C7** e **D2**. É o bloco que mais costuma aparecer no termômetro; se for o caso, use o tempo que sobrar dos outros.

```
R3 — HTTP

 CLIENTE ── REQUISIÇÃO ──► SERVIDOR
 CLIENTE ◄── RESPOSTA ──── SERVIDOR
 STATELESS: o servidor não lembra → o cliente manda cookie/token em TODA requisição
 HTTP = porta 80, texto aberto | HTTPS = porta 443, criptografado (cadeado)

 MÉTODO = o verbo          │ STATUS = como foi
  GET     ler              │  2xx  deu CERTO     200 OK • 201 criado • 204 sem conteúdo
  POST    criar            │  3xx  REDIRECIONA   301 mudou de endereço
  PUT     substituir TUDO  │  4xx  erro no PEDIDO 400 mal feito • 401 quem é você?
  PATCH   alterar UMA PARTE│                      403 não pode • 404 não existe
  DELETE  apagar           │                      409 conflito • 429 calma!
                           │  5xx  erro no SERVIDOR 500 bug • 503 fora do ar

 TRÊS TIPOS DE ERRO, TRÊS LUGARES PARA PROCURAR
  4xx        → o PEDIDO está errado   → corrija a requisição
  5xx        → o SERVIDOR falhou      → mudar o pedido não resolve
  sem código → a resposta nem chegou  → problema de REDE (internet, DNS, porta)
```

🗣️ **401 × 403 (sempre confunde):** 401 é chegar na portaria **sem crachá** ("quem é você?"); 403 é ter crachá e tentar entrar na sala da diretoria ("sei quem você é, e você não pode"). Peça para alguém da turma explicar com outra analogia.

🗣️ **PUT × PATCH:** mande no quadro os dois corpos lado a lado. PUT: `{"nome": "Ana", "telefone": "9999", "email": "ana@x.com"}` (tudo); PATCH: `{"telefone": "9999"}` (só o que muda).

🗣️ **Gancho sem a API:** na C6 (j), pergunte "o 204 do DELETE é erro?" (não: 2xx é sucesso). E "se eu pedir com GET o produto que acabei de apagar, o que volta?" (404: ele não existe mais).

---

## BLOCO 8 — Ticket de saída (3h35–3h50)

> **Com o site:** mude a fase para **Ticket de saída**. Os alunos veem só as 5 perguntas abaixo. No fim, mude para **Encerrada**, exporte o JSON **e** o CSV em `/professor/dados` e rode `.\scripts\derrubar-aula.ps1`.

**Sem consulta**, meia folha, 5 minutos para responder. Serve para comparar com a atividade: o que eles sabem **depois** da revisão, sem caderno nem internet.

```
TICKET DE SAÍDA — sem consulta       Nome/apelido: ______________

 1. Um fone Bluetooth ligado ao celular é que tipo de rede?
 2. Acessei http://localhost:8080. Estou acessando qual computador?
 3. Assistir a uma live: UDP ou TCP? Por quê?
 4. Fiz login, mas não sou administrador e tentei entrar na área
    do administrador. Qual código de status?
 5. Quero mudar SÓ o preço do produto 7. Qual método e qual URL?
```

🗣️ Recolha os tickets e as folhas da atividade **juntos** (grampeados, se der).

**Respostas:** 1. PAN • 2. o seu próprio computador • 3. UDP, porque é ao vivo: não vale a pena esperar o pedaço perdido • 4. 403 • 5. `PATCH /api/produtos/7`

---

## BLOCO 9 — Fechamento (3h50–4h00)

```
 ✔ Redes: PAN < LAN < MAN < WAN | cliente-servidor × P2P
 ✔ URL → DNS → roteador → ISP → backbone → servidor
 ✔ UDP = ao vivo, sem garantia | TCP = não pode faltar, handshake
 ✔ HTTP: método (o que fazer) + status (como foi)
 ✔ 4xx pedido • 5xx servidor • sem código = rede

 PROVA 1 → AULA 05
```

🗣️ **Pergunta de saída (oral):** "Qual assunto vocês acham que ainda precisam estudar em casa antes da prova?"

---

## Depois da aula: lendo as folhas

O que vale olhar em cada folha, nesta ordem:

1. **Marcações [S][C][P][?] por questão.** Some quantos marcaram [?] ou [P] em cada uma. Assuntos com muitos [P] e [?] não ficaram, mesmo que a resposta esteja certa.
2. **Azul × vermelho.** Muito vermelho num bloco que você revisou rápido = esse bloco precisa voltar na aula 05.
3. **Ticket × atividade.** Se o aluno errou a questão na atividade e acertou no ticket, a revisão funcionou.
4. **Parte E.** As respostas da E2 dizem o que deixou a aula 02 confusa do ponto de vista deles; use para ajustar as próximas aulas.
5. **Questões marcadas com [P].** Se a turma pesquisou muito, vale indicar boas fontes na próxima aula (ex.: MDN Web Docs para HTTP).

---

## Gabarito comentado

> ⚠️ **Erro comum** indica o que a turma provavelmente vai errar, e onde vale insistir na correção.

### Parte A — Redes e Internet

**A1.** Dois ou mais dispositivos ligados entre si para **trocar dados** e **compartilhar recursos**. Exemplos: Wi-Fi de casa, rede do celular, rede da escola.
⚠️ Responder só "é a internet". A Internet é **uma** rede (a maior), não a definição de rede.

**A2.** a) WLAN (aceite LAN, mas lembre que Wi-Fi é a LAN **sem fio**) • b) WAN • c) PAN • d) LAN • e) MAN

**A3.** PAN (Bluetooth) + WLAN (Wi-Fi) em casa; depois PAN + WAN (4G). O celular usa várias redes **ao mesmo tempo**.

**A4.** a) Hardware • b) Software • c) Software • d) Serviço • e) Espaço • f) Hardware
⚠️ Classificar o MySQL como "serviço". Aceite com justificativa, mas no Quadro 3 da aula 01 banco de dados está em **software**.

**A5.** a) Cliente-servidor • b) P2P • c) Cliente-servidor • d) Cliente-servidor • e) P2P
Se o servidor cai, **ninguém** consegue usar. No P2P, os outros **continuam** funcionando.

**A6.** ISP = a empresa que conecta você à Internet (Vivo, Claro, TIM, provedor de fibra do bairro). Backbone = as grandes "rodovias" da Internet: cabos de fibra de altíssima velocidade ligando cidades, países e continentes.

**A7.** Ordem correta, de cima para baixo na folha: **5 – 7 – 2 – 3 – 6 – 1 – 4**
(1 digito → 2 DNS → 3 roteador de casa → 4 ISP → 5 backbone → 6 servidor responde → 7 navegador mostra)
⚠️ Colocar o DNS depois do roteador ou do ISP.

**A8.** Traduz o **nome** do site (`www.site.com.br`) para o **endereço IP** (ex.: `200.150.10.5`). É uma "agenda" porque, como na agenda do celular, você procura pelo **nome** e ela te dá o **número**.

**A9.** HTTP = 80 • HTTPS = 443 • MySQL = 3306. O IP é o **endereço do prédio**; a porta é o **número do apartamento** (cada programa "mora" numa porta).

**A10.** **Não.** `localhost` (127.0.0.1) é sempre **o próprio computador**. No seu PC, `localhost:3000` procura um programa rodando **na sua máquina**; como o site do colega está na máquina dele, você vai ver um erro de conexão (ou outro programa seu, se tiver algo nessa porta).
⚠️ É o erro mais importante da folha para quem programa. Se muitos errarem, retome na aula de IP.

**A11.** a) **Latência**: tempo que o dado leva para ir e voltar (em ms); latência alta = sistema "lento". b) **Deploy**: colocar o sistema no ar, num servidor, para outras pessoas acessarem. c) **API**: o jeito de um programa conversar com outro pela rede (o app pede dados, o servidor responde).

### Parte B — UDP e TCP

**B1.**

| | UDP | TCP |
|---|---|---|
| Abre conexão? | Não | Sim (three-way handshake) |
| Entrega garantida? | Não | Sim (confirma e reenvia) |
| Ordem certa? | Não garantida | Sim |
| Exemplo | DNS, chamada de vídeo, jogo online, HTTP/3 | sites, APIs, e-mail, banco de dados, download |

**B2.** a) UDP: é ao vivo; esperar o pedaço perdido atrasaria a conversa • b) TCP: não pode faltar nenhum pedaço • c) UDP: a posição de 1 segundo atrás já não serve • d) TCP: os dados precisam chegar completos e certos • e) UDP: é uma pergunta pequena e rápida (se perder, pergunta de novo)
⚠️ Responder "UDP porque é mais rápido" sem falar de **perda** e **ordem**. Peça a justificativa com a pergunta-chave do R2.

**B3.** SYN ("quero conectar", e manda o número de sequência inicial) → SYN-ACK ("recebi seu pedido, e eu também quero conectar") → ACK ("confirmado"; a partir daqui vão os dados).
⚠️ Inverter a ordem do SYN-ACK e do ACK, ou achar que o **servidor** começa.

**B4.** a) **F**: o UDP não é sempre mais rápido nem inútil; o DNS usa UDP, e quando a aplicação precisa de garantia, ela mesma cuida disso • b) **V** • c) **F**: no UDP os dados **podem** chegar fora de ordem • d) **V** • e) **V**: o HTTP/3 usa o QUIC, que roda sobre UDP

**B5.** Porque é **ao vivo**: o pedaço perdido, quando chegasse, já estaria atrasado e não serviria mais. Esperar faria a chamada travar para todo mundo. Melhor seguir com o que está acontecendo **agora**.

### Parte C — HTTP

**C1.** HyperText Transfer Protocol: o protocolo (as "regras da conversa") que sites, apps e APIs usam para trocar dados. O **cliente** (navegador, app) faz a requisição; o **servidor** envia a resposta.

**C2.** HTTP usa a porta **80** e manda tudo em **texto aberto**: quem estiver no caminho pode ler. HTTPS usa a porta **443**, os dados vão **criptografados**, e o navegador mostra o **cadeado**.
🗣️ Não cobre como a criptografia funciona; isso não foi dado.

**C3.** Em **toda** requisição, o navegador manda junto uma identificação: um **cookie** ou um **token** (que o servidor entregou no login). Assim o servidor "reconhece" você sem precisar lembrar.
🗣️ Se esse assunto não tiver sido dado na aula 02, aceite qualquer resposta pesquisada que fale de cookie, sessão ou token.

**C4.** a) GET • b) POST • c) PATCH • d) DELETE • e) PUT
Os itens c) e e) cobrem a diferença PUT × PATCH (a antiga C5 foi tirada da folha): peça para quem acertou explicar por que um é PATCH e o outro é PUT.

**C5.** 2xx = sucesso • 3xx = redirecionamento • 4xx = erro do cliente (o pedido está errado) • 5xx = erro do servidor

**C6.** a) 404 • b) 401 • c) 403 • d) 400 • e) 500 • f) 409 • g) 429 • h) 503 • i) 201 • j) 204
⚠️ Trocar o **401** e o **403** (b e c). Use a analogia do crachá.
⚠️ Responder **200** na (i): 200 não está errado de todo (é sucesso), mas o mais correto para "criado" é o **201**.

**C7.** a) **400**: o problema está no **pedido** (dado faltando, JSON quebrado). Revise o que foi enviado • b) **503**: o problema está no **servidor** (fora do ar, em manutenção ou sobrecarregado). Mudar o pedido não resolve: espere e tente mais tarde • c) **Sem código**: a resposta **nem chegou**, é problema de **rede**. Confira a internet, se o endereço está certo (DNS) e se o servidor está ligado.
⚠️ Achar que "não foi possível acessar o site" é um erro 404. O 404 é uma **resposta** do servidor; aqui o servidor nem respondeu.

### Parte D — Lendo URLs e respostas

**D1.** Protocolo: `https` • Domínio: `bolsa.fly.dev` • Caminho: `/api/batatas` • Query string: `setor=doce&precoMax=10`. Trocando para `gourmet`, a lista passa a mostrar as batatas do setor gourmet (com preço até 10). A URL muda, o recurso é o mesmo, o **filtro** é que muda.

**D2.** a) Deu **erro**: o código é 400 (4xx), e o corpo diz "JSON inválido" • b) No **pedido** dela (4xx = erro do cliente) • c) Corrigir o JSON do corpo: conferir aspas duplas, vírgulas e chaves, como diz a `dica`.

---

## Impacto no cronograma (já registrado no `plano_de_aula.md`)

- **Aula 04:** Topologias, meios de transmissão e Ethernet (era a aula 03).
- **Aula 05:** Prova 1, cobrindo redes, transporte (UDP × TCP), HTTP, topologias, meios e Ethernet. A revisão parte dos pontos fracos desta atividade.
- **Aula 08:** Modelos OSI e TCP/IP + equipamentos de rede, com Packet Tracer (cobrados na Prova 2).
- **Aula 09:** cabeamento estruturado e LAN cabeada na mesma aula.
- **Aula 13:** ganha a noção de criptografia no HTTPS (TLS, chaves, certificado).
