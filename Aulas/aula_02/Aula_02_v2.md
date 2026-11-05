# Aula 02 — Modelos OSI e TCP/IP, UDP × TCP e HTTP
### Conteúdo para o quadro (versão 2)

**Como usar este arquivo**
- Cada **Quadro** é um bloco: escreva → alunos copiam e leem → explique → faça a pergunta de checagem → apague.
- O que está dentro das caixas de código é **exatamente o que vai no quadro**.
- As linhas marcadas com 🗣️ são **só para o professor** (falas, exemplos, perguntas). Não precisam ir para o quadro.
- Seções marcadas como **📋 Colinha do professor** também **não vão para o quadro**: são apoio para explicar oralmente.
- Sugestão: título de cada quadro e palavras-chave em outra cor.
- **1ª metade:** camadas e TCP/IP de forma leve (OSI só como referência, não cai na prova) → UDP × TCP → HTTP, métodos e erros.
- **2ª metade:** quadros curtos de HTTP intercalados com a prática na API (roteiro em `Segunda_metade_recomendacao.md`).

| Quadro | Tema | Horário previsto |
|:---:|---|:---:|
| — | Retomada da aula 01 | 0h00–0h10 |
| 1 | Por que a rede é dividida em camadas? | 0h10–0h25 |
| 2 | Modelos OSI e TCP/IP (+ 📋 colinha de encapsulamento, só oral) | 0h25–0h50 |
| 3 | Camada de transporte: UDP × TCP | 0h50–1h10 |
| 4 | HTTP: o protocolo da web | 1h10–1h25 |
| 5 | Métodos HTTP e erros HTTP | 1h25–1h45 |
| — | Intervalo | 1h45–2h00 |
| 6 | Anatomia da URL e da mensagem HTTP | 2h00–2h15 |
| — | Prática 1: navegador + DevTools | 2h15–2h35 |
| 7 | API REST, CRUD e respostas de sucesso | 2h35–2h50 |
| — | Prática 2: CRUD com Swagger, cliente HTTP e curl | 2h50–3h35 |
| 8 | Cabeçalhos, autenticação e HTTPS | 3h35–3h47 |
| — | Prática 3: token (401 × 403) | 3h47–3h55 |
| 9 | Resumo da aula | 3h55–4h00 |

---

## Retomada (0h00–0h10)

🗣️ Desenhe rapidamente o caminho do **Quadro 7 da aula 01** (`Navegador → Roteador → ISP → Backbone → Servidor`) e pergunte: *"Quem traduz o nome do site para IP?"* (DNS), *"Qual a porta do HTTPS?"* (443). Feche com: *"Hoje vamos ver que esse caminho é organizado em CAMADAS, e vamos entender a 'língua' que o navegador fala com o servidor: o HTTP."*

---

## QUADRO 1 — Por que a rede é dividida em camadas?

```
POR QUE DIVIDIR A REDE EM CAMADAS?

Mandar dados pela rede envolve MUITAS tarefas:
 sinal no cabo, endereço, rota, conferir erros, entender o conteúdo...

SOLUÇÃO: dividir o trabalho em CAMADAS
 • cada camada cuida de UMA parte do trabalho
 • cada camada só conversa com a de cima e a de baixo
 • dá para trocar uma camada sem mexer nas outras
   (ex.: troquei o cabo pelo Wi-Fi e o site continua igual)

PADRONIZAÇÃO → fabricantes diferentes seguem as mesmas regras
             → tudo consegue conversar = INTEROPERABILIDADE

ANALOGIA: mandar uma ENCOMENDA
 Escrever a carta              → APLICAÇÃO   (o conteúdo)
 Embalar, etiquetar, rastrear  → TRANSPORTE  (chegou? chegou inteiro?)
 Correios escolhem a rota      → REDE        (endereço e caminho)
 Caminhão, avião, carteiro     → FÍSICA      (o meio que leva)
```

🗣️ **Exemplo:** quem escreve a carta não precisa saber se ela vai de caminhão ou de avião. Do mesmo jeito, quem programa um site não precisa saber se o usuário está no Wi-Fi ou no 5G.

🗣️ **Checagem:** "Se a escola trocar todos os cabos por fibra óptica, precisamos reprogramar os sites?" (não — só a camada física mudou).

---

## QUADRO 2 — Modelos OSI e TCP/IP

🗣️ Projete as imagens `OSI_7_camadas.png` e `TCP_IP_4_Camadas.png` enquanto os alunos copiam.

```
MODELOS DE REFERÊNCIA

OSI    → ISO, 1984 → 7 camadas → modelo TEÓRICO (para estudar)
TCP/IP → Vint Cerf e Bob Kahn, anos 1970 (ARPANET)
       → 4 camadas → o que a INTERNET USA DE VERDADE

  OSI (7)           │ TCP/IP (4)      │ EXEMPLOS
 ───────────────────┼─────────────────┼──────────────────────────────
  7 Aplicação       │                 │ HTTP, HTTPS, DNS, e-mail
  6 Apresentação    │ APLICAÇÃO       │ formato dos dados, criptografia
  5 Sessão          │                 │ abrir/manter/fechar o diálogo
 ───────────────────┼─────────────────┼──────────────────────────────
  4 Transporte      │ TRANSPORTE      │ UDP, TCP → PORTAS
 ───────────────────┼─────────────────┼──────────────────────────────
  3 Rede            │ INTERNET        │ IP → endereço IP, ROTEADOR
 ───────────────────┼─────────────────┼──────────────────────────────
  2 Enlace          │ ACESSO À REDE   │ Ethernet, Wi-Fi → MAC, SWITCH
  1 Física          │                 │ cabo, fibra, rádio → BITS

```

🗣️ **Ênfase leve:** o OSI **não cai na prova**: ele aparece como referência, porque é o "vocabulário" que se usa no mercado ("isso é problema de camada 7"). O importante é saber **onde o desenvolvedor trabalha**: na camada de **Aplicação** (HTTP), usando o **Transporte** (portas). Ethernet/MAC/switch voltam nas aulas 03–04 e IP nas aulas 06–07.

🗣️ **Checagem:** "O HTTP fica em qual camada?" (Aplicação). "As 3 camadas de cima do OSI viram qual camada no TCP/IP?" (Aplicação).

---

### 📋 Colinha do professor — Encapsulamento (não vai para o quadro)

Use para explicar, **oralmente**, como as camadas do Quadro 2 trabalham juntas. Pode desenhar só as caixinhas no canto do quadro enquanto fala, sem pedir para copiar.

```
ENCAPSULAMENTO = cada camada coloca um "envelope" (CABEÇALHO)
em volta dos dados que recebeu da camada de cima.

 APLICAÇÃO     [ DADOS ]                    → DADOS
 TRANSPORTE    [TCP| DADOS ]                → SEGMENTO
 REDE          [IP|TCP| DADOS ]             → PACOTE
 ENLACE        [ETH|IP|TCP| DADOS ]         → QUADRO
 FÍSICA        01011001110100101...         → BITS

 ENVIANDO   → os dados DESCEM as camadas → ENCAPSULA   (põe envelopes)
 RECEBENDO  → os dados SOBEM as camadas  → DESENCAPSULA (abre envelopes)

PDU = nome do "pacotinho" em cada camada:
 Dados → Segmento → Pacote → Quadro → Bits
```

🗣️ **Como contar:** caixa dentro de caixa (boneca russa). Cada camada só lê o "envelope" dela: o roteador olha o envelope IP, o switch olha o envelope Ethernet, e só o programa no destino abre os DADOS.

🗣️ **Gancho:** a parte de dentro, os DADOS, é justamente a mensagem HTTP que vamos estudar no resto da aula.

---

## QUADRO 3 — Camada de transporte: UDP × TCP

```
CAMADA DE TRANSPORTE: UDP e TCP
Levam os dados até o PROGRAMA certo, usando PORTAS.
 (aula 01: IP = endereço do prédio | PORTA = número do apartamento)
 80 HTTP • 443 HTTPS • 53 DNS • 3306 MySQL • 5432 PostgreSQL

              │ UDP                       │ TCP
 ─────────────┼───────────────────────────┼──────────────────────────
 Conexão      │ não abre, só envia        │ abre conexão antes
 Entrega      │ NÃO garantida             │ GARANTIDA (confirma e
              │ (perdeu, perdeu)          │ reenvia o que se perdeu)
 Ordem        │ pode chegar fora de ordem │ chega na ordem certa
 Velocidade   │ mais leve, menos atraso   │ mais controle, mais
              │                           │ "burocracia"
 Usado em     │ DNS, voz/vídeo ao vivo,   │ sites, APIs, e-mail,
              │ jogos online, HTTP/3      │ banco de dados

TCP — THREE-WAY HANDSHAKE (aperto de mão em 3 etapas)
 Cliente ── SYN ─────►  Servidor   "quero conectar"
 Cliente ◄── SYN-ACK ── Servidor   "recebi, e eu também quero"
 Cliente ── ACK ─────►  Servidor   "confirmado!" → agora vão os dados
```

🗣️ **Analogias:**
- **UDP** = uma live: se um quadro do vídeo se perde, não adianta voltar atrás — o que importa é o que está acontecendo agora. No jogo online, a posição do jogador de 1 segundo atrás já não serve para nada.
- **TCP** = entrega com rastreio e aviso de recebimento: se um pedaço se perde, ele é reenviado; o destinatário recebe tudo na ordem.

🗣️ **Detalhes do handshake (oral):** SYN = *synchronize* (o cliente manda seu número de sequência inicial); SYN-ACK = o servidor confirma o número do cliente e manda o seu; ACK = *acknowledgment* (o cliente confirma). Os números de sequência são o que permite ao TCP **ordenar** e **detectar perdas**.

🗣️ **Cuidado com o mito:** UDP não é "sempre mais rápido" nem "inútil para coisas importantes". Ele só não oferece garantias; se a aplicação precisar de confiabilidade, ela mesma faz isso (é exatamente o que o QUIC do HTTP/3 faz — próximo quadro).

🗣️ **Checagem:** "A chamada de vídeo travou e pulou um pedaço da fala. UDP ou TCP?" (UDP). "Baixar um PDF da escola: UDP ou TCP?" (TCP — não pode faltar nenhum pedaço).

---

## QUADRO 4 — HTTP: o protocolo da web

```
HTTP = HyperText Transfer Protocol
 • protocolo da camada de APLICAÇÃO
 • usado por sites, apps e APIs para trocar dados
 • CLIENTE-SERVIDOR: o cliente PEDE, o servidor RESPONDE

    [Cliente] ── REQUISIÇÃO (request) ──► [Servidor]
    [Cliente] ◄── RESPOSTA (response) ─── [Servidor]

 • STATELESS (sem estado): cada requisição é independente,
   o servidor NÃO "lembra" da anterior → por isso existem cookies e tokens

VERSÕES
 HTTP/0.9 (1991)  só GET, só texto
 HTTP/1.0 (1996)  cabeçalhos, códigos de status, POST
 HTTP/1.1 (1997)  reaproveita a conexão, cabeçalho Host → muito usado até hoje
 HTTP/2   (2015)  binário, várias requisições ao mesmo tempo na mesma conexão
 HTTP/3   (2022)  troca o TCP pelo QUIC (que roda sobre UDP) → menos atraso

HTTP  → porta 80  → tudo em texto aberto: quem está no caminho pode LER
HTTPS → porta 443 → HTTP + TLS (criptografia) → o "cadeado" do navegador
```

🗣️ **Ligação com o quadro 3:** HTTP/1.1 e HTTP/2 rodam em cima do TCP (precisam do handshake antes). O HTTP/3 usa o **QUIC sobre UDP**: o próprio QUIC cuida de confirmar, reenviar e ordenar, e já faz a criptografia (TLS 1.3) junto com a conexão — por isso começa a conversar mais rápido.

🗣️ **Stateless na prática:** "Se o servidor não lembra de nada, como o Instagram sabe que você está logado em cada clique?" → o navegador manda junto, em **toda** requisição, um cookie ou um token. Isso vai aparecer na prática.

🗣️ **Checagem:** "HTTP/3 usa UDP ou TCP?" (UDP, via QUIC). "Qual a diferença entre HTTP e HTTPS?" (HTTPS é criptografado, porta 443).

---

## QUADRO 5 — Métodos HTTP e erros HTTP

```
MÉTODO = o "verbo" da requisição: diz O QUE eu quero fazer

 GET      buscar / ler um recurso
 POST     criar / enviar dados para o servidor processar
 PUT      substituir um recurso INTEIRO
 PATCH    alterar só UMA PARTE do recurso
 DELETE   apagar um recurso
 HEAD     igual ao GET, mas volta só os cabeçalhos (sem corpo)
 OPTIONS  pergunta ao servidor: "o que eu posso fazer aqui?"
 (existem ainda CONNECT e TRACE, quase não usados no dia a dia)

CÓDIGO DE STATUS = 3 dígitos; o 1º dígito diz o TIPO da resposta
 1xx informação • 2xx SUCESSO • 3xx REDIRECIONAMENTO
 4xx ERRO DO CLIENTE  → o PEDIDO está errado     → corrija a requisição
 5xx ERRO DO SERVIDOR → o pedido pode estar certo → o SERVIDOR falhou

ERROS DO CLIENTE (4xx)
 400 Bad Request         pedido mal feito (JSON quebrado, campo faltando)
 401 Unauthorized        não sei QUEM você é (sem login / sem token)
 403 Forbidden           sei quem você é, mas você NÃO PODE
 404 Not Found           esse recurso não existe
 405 Method Not Allowed  método errado para esse endereço
 409 Conflict            conflito (ex.: e-mail já cadastrado)
 429 Too Many Requests   pedidos demais, espere um pouco

ERROS DO SERVIDOR (5xx)
 500 Internal Server Error  erro no código do servidor (bug)
 502 Bad Gateway            um intermediário recebeu resposta inválida
 503 Service Unavailable    fora do ar, sobrecarregado ou em manutenção
 504 Gateway Timeout        o servidor demorou demais para responder

SEM CÓDIGO NENHUM → erro de REDE: a resposta nem chegou
 (sem internet, DNS não achou o site, conexão recusada, timeout)

MACETE: 4xx = "a culpa é sua" | 5xx = "a culpa é minha" (do servidor)
```

🗣️ **Três tipos de erro, três lugares para procurar:**
1. **4xx**: o servidor respondeu e disse que **o pedido** está errado → revise método, URL, corpo e token.
2. **5xx**: o servidor respondeu, mas **ele** falhou → não adianta mudar o pedido; quem resolve é quem cuida do servidor.
3. **Sem código**: **não houve resposta HTTP** → o problema está nas camadas de baixo (rede, DNS, porta). É aqui que o conteúdo de redes ajuda o dev.

🗣️ **401 × 403, que confunde todo mundo:** 401 é chegar na portaria **sem crachá** ("quem é você?"); 403 é ter crachá, mas tentar entrar na sala da diretoria ("eu sei quem você é, e você não pode").

🗣️ **Para que servem HEAD e OPTIONS:** HEAD serve para saber se algo existe ou mudou, ou qual o tamanho de um arquivo, sem baixá-lo. OPTIONS o navegador usa sozinho em algumas requisições entre sites diferentes (o *preflight* do CORS); eles vão esbarrar nisso quando fizerem front-end.

🗣️ **Bônus (oral, opcional):** GET e HEAD não devem alterar nada no servidor (são "seguros"). GET, PUT e DELETE são **idempotentes**: repetir a mesma requisição 10 vezes deixa o servidor no mesmo estado que 1 vez. POST não: 10 POSTs criam 10 produtos.

🗣️ **Curiosidade:** `418 I'm a teapot` ("sou um bule de chá") nasceu como piada de 1º de abril em 1998 e nunca morreu. Dá para testar no `/api/bule`.

🗣️ **Se precisar encurtar:** HEAD/OPTIONS e os códigos 405, 409, 502 e 504 podem ser só falados.

🗣️ **Checagem:** "Pedi `/api/products/99999` e o produto não existe. Qual código?" (404). "O app mostra 'erro 500'. Adianta o usuário tentar de novo do mesmo jeito?" (o problema é do servidor; talvez funcione mais tarde, mas mudar o pedido não resolve). "O navegador diz 'Não foi possível acessar o site'. Tem código HTTP?" (não — é erro de rede).

---

## — INTERVALO (1h45–2h00) —

🗣️ Durante o intervalo: ligar os computadores do laboratório, abrir o navegador na URL da API e confirmar que a máquina da API no Fly.io está acordada (ver checklist em `Segunda_metade_recomendacao.md`).

---

## QUADRO 6 — Anatomia da URL e da mensagem HTTP

```
URL:  https://api.exemplo.com:443/api/products/42?sort=price&page=2

 https://            → PROTOCOLO
 api.exemplo.com     → DOMÍNIO (o DNS traduz para um IP)
 :443                → PORTA (443 é o padrão do HTTPS, pode omitir)
 /api/products/42    → CAMINHO: qual RECURSO quero (42 = parâmetro de caminho)
 ?sort=price&page=2  → QUERY STRING: parâmetros chave=valor, separados por &

REQUISIÇÃO (cliente → servidor)
 GET /api/products/42 HTTP/1.1        ← MÉTODO + CAMINHO + VERSÃO
 Host: api.exemplo.com                ← CABEÇALHOS (headers)
 Accept: application/json               formato  "Nome: valor"
                                      ← linha em branco
 (corpo / body — opcional)            ← dados enviados (POST, PUT, PATCH)

RESPOSTA (servidor → cliente)
 HTTP/1.1 200 OK                      ← VERSÃO + CÓDIGO DE STATUS
 Content-Type: application/json       ← CABEÇALHOS
                                      ← linha em branco
 {"id": 42, "name": "Teclado"}        ← CORPO (body)
```

🗣️ **Mostre ao vivo antes da prática:** abra `https://<app>.fly.dev/api/ola` no projetor, aperte **F12 → aba Rede (Network)**, recarregue e clique na requisição. Mostre que a tela das DevTools tem exatamente as partes do quadro: método, URL, status, cabeçalhos de requisição, cabeçalhos de resposta e corpo.

🗣️ **Espaço na URL:** URL não aceita espaço; ele vira `%20` (ex.: `?q=batata%20doce`). Isso aparece no `/api/busca`.

🗣️ **Checagem:** "Em `/api/products?category=books`, o que é o `category`?" (parâmetro da query string). "Onde vai o JSON de um produto novo: na URL ou no corpo?" (no corpo).

---

## — PRÁTICA 1 (2h15–2h35): navegador + DevTools —

🗣️ Roteiro completo em `Segunda_metade_recomendacao.md`.

---

## QUADRO 7 — API REST, CRUD e respostas de sucesso

🗣️ Os métodos e os erros já foram vistos no Quadro 5. Este quadro mostra **como eles se juntam numa API de verdade** e quais códigos aparecem quando **dá certo**. É a "receita" da Prática 2.

```
API REST = um jeito de organizar APIs usando o HTTP:
 • tudo é um RECURSO com endereço   → /api/products/42
 • o MÉTODO diz a ação              → DELETE /api/products/42
                                      (e não /api/apagarProduto?id=42)
 • dados normalmente em JSON        → {"name": "Teclado", "price": 120}

 CRUD   │ MÉTODO + URL                │ CORPO?  │ SE DER CERTO
 ───────┼─────────────────────────────┼─────────┼──────────────────
 Create │ POST   /api/products        │ sim     │ 201 Created
 Read   │ GET    /api/products        │ não     │ 200 OK (lista)
 Read   │ GET    /api/products/42     │ não     │ 200 OK (um item)
 Update │ PUT    /api/products/42     │ sim     │ 200 OK
 Update │ PATCH  /api/products/42     │ sim     │ 200 OK
 Delete │ DELETE /api/products/42     │ não     │ 204 No Content

REDIRECIONAMENTOS (3xx)
 301 / 302 → o recurso mudou de endereço (veja o cabeçalho Location)
 304       → não mudou desde a última vez: use a cópia do cache
```

🗣️ **CRUD:** *Create, Read, Update, Delete* — as 4 operações básicas de quase todo sistema (cadastro de alunos, produtos, pedidos…).

🗣️ **PUT × PATCH:** PUT manda o produto **inteiro** (o que não for mandado some/é obrigatório); PATCH manda **só o que muda** (`{"price": 99.90}`).

🗣️ **201 e 204:** o 201 costuma vir com o cabeçalho `Location` dizendo onde o recurso novo mora (`/api/products/43`). O 204 é "deu certo, e não tenho nada para te mostrar".

🗣️ **Checagem:** "Quero mudar só o preço do produto 7. Qual método e qual URL?" (`PATCH /api/products/7`). "Apaguei um produto e veio 204. Deu erro?" (não — 2xx é sucesso).

---

## — PRÁTICA 2 (2h50–3h35): CRUD com Swagger, cliente HTTP e curl —

🗣️ Roteiro completo em `Segunda_metade_recomendacao.md`. Na "caça aos erros", peça para os alunos classificarem cada erro usando o Quadro 5: 4xx, 5xx ou sem código?

---

## QUADRO 8 — Cabeçalhos, autenticação e HTTPS

```
CABEÇALHOS (HEADERS) IMPORTANTES
 Content-Type   tipo do CORPO enviado   → application/json, image/png
 Accept         tipo que o cliente quer receber
 Authorization  credencial              → Authorization: Bearer <token>
 User-Agent     quem está pedindo (navegador, curl, Postman...)
 Location       onde está o recurso criado / para onde ir
 Cache-Control  pode guardar em cache? por quanto tempo?

AUTENTICAÇÃO × AUTORIZAÇÃO
 Autenticação = QUEM é você?             falhou → 401
 Autorização  = o que você PODE fazer?   falhou → 403
 Login → servidor devolve um TOKEN → cliente manda o token em TODA requisição
 (porque o HTTP é stateless!)

HTTPS = HTTP + TLS
 1. Chave ASSIMÉTRICA (pública + privada) → no INÍCIO da conexão:
    o CERTIFICADO prova que o servidor é quem diz ser
    e os dois lados combinam uma chave secreta
 2. Chave SIMÉTRICA (a mesma dos dois lados) → no RESTO da conversa:
    muito mais rápida para criptografar os dados
 Sem HTTPS: senha e token viajam em texto que qualquer um no caminho lê!
```

🗣️ **Assimétrica, para explicar:** o que é trancado com a chave **pública** só abre com a **privada** (que só o servidor tem). E o servidor pode **assinar** algo com a privada: qualquer um confere a assinatura com a pública, mas ninguém consegue falsificar. O certificado é exatamente isso: uma "carteira de identidade" do site assinada por uma autoridade certificadora em que o navegador confia.

🗣️ **Por que usar as duas?** A assimétrica é segura para começar uma conversa com um desconhecido, mas é lenta. Então ela só é usada para combinar uma chave simétrica, e daí em diante tudo é criptografado com a simétrica (ex.: AES).

🗣️ **Sobre o token da prática (JWT):** muitos tokens são JWT. Um JWT é **assinado**, não criptografado: qualquer um consegue **ler** o conteúdo dele (vamos ver isso na Prática 3), mas ninguém consegue **alterá-lo** sem invalidar a assinatura. Por isso nunca se coloca senha dentro de um token, e por isso o token precisa viajar por HTTPS.

🗣️ **Checagem:** "Fiz login, mas tentei acessar a área de admin sem ser admin. 401 ou 403?" (403). "Por que o HTTPS não usa só a chave assimétrica?" (é lenta).

---

## — PRÁTICA 3 (3h47–3h55): token, 401 × 403 —

🗣️ Roteiro completo em `Segunda_metade_recomendacao.md`.

---

## QUADRO 9 — Resumo da aula

```
RESUMO DA AULA 02
 ✔ CAMADAS: cada uma faz uma parte → padronização
 ✔ TCP/IP = 4 camadas (Internet real) | OSI = 7 camadas (referência)
 ✔ UDP = leve, sem garantia de entrega
   TCP = confiável, com conexão (handshake SYN, SYN-ACK, ACK)
 ✔ HTTP = cliente faz REQUISIÇÃO, servidor devolve RESPOSTA (stateless)
 ✔ Requisição = MÉTODO + URL + CABEÇALHOS + corpo
   Resposta   = STATUS + CABEÇALHOS + corpo
 ✔ GET ler • POST criar • PUT/PATCH alterar • DELETE apagar
 ✔ 2xx ok • 3xx redireciona • 4xx erro do cliente • 5xx erro do servidor
   sem código = erro de rede
 ✔ HTTPS = HTTP + TLS → dados criptografados no caminho

PRÓXIMA AULA: Topologias, meios de transmissão e Ethernet
```

🗣️ **Pergunta de saída:** "Qual ferramenta vocês mais gostaram de usar para fazer requisições, e por quê?"

---

## O que mudou em relação à versão 1 (`Aula_02.md`)

- Conteúdo reorganizado em quadros numerados com tempos, falas (🗣️) e checagens, no mesmo formato da aula 01.
- OSI mantido só como referência (não cai na prova); o encapsulamento virou colinha do professor, explicado oralmente.
- HTTP ampliado: stateless, todos os métodos (incluindo HEAD e OPTIONS), tipos de erro (4xx, 5xx e erro de rede sem código), anatomia da URL e da mensagem, REST/CRUD, cabeçalhos, autenticação (401 × 403).
- QUIC simplificado para o nível da turma (detalhe técnico ficou como fala do professor).
- Correções: o exemplo de criptografia simétrica era "JWT", mas um JWT normalmente é **assinado**, não criptografado (o exemplo correto é a chave de sessão do HTTPS, ex.: AES); "criptografar com a chave privada" foi reescrito como **assinatura digital**, que é o uso real.
