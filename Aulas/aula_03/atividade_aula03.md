# Atividade — O que ficou das aulas 01 e 02?

**Nome ou apelido:** ______________________________  **Data:** ____/____/______

---

### ISTO NÃO É PROVA

Não vale nota. Serve para o professor saber **o que ficou claro e o que precisa ser explicado de novo**.

- Você **pode** usar o caderno, a colinha, a internet e conversar com o colega.
- Mas escreva a resposta **com as suas palavras** (copiar e colar da internet não ajuda ninguém).
- Comece pelas questões marcadas com ⭐. Se sobrar tempo, faça as outras.
- O **gabarito** está no final deste material. Tente responder antes de conferir.

---

## PARTE A — Redes e Internet (aula 01)

**A1 ⭐**
Com suas palavras: o que é uma rede de computadores? Cite uma rede que você usou hoje.

&nbsp;

**A2 ⭐**
Escreva o tipo de rede (**PAN, LAN, WLAN, MAN** ou **WAN**) de cada situação:

| Situação | Tipo de rede |
|---|---|
| a) O Wi-Fi da sua casa | |
| b) A Internet | |
| c) Um fone Bluetooth ligado ao celular | |
| d) Os computadores do laboratório ligados por cabo | |
| e) Uma rede que liga todas as escolas de uma prefeitura | |

**A3**
Você está ouvindo música num fone Bluetooth, com o celular no Wi-Fi de casa. Aí você sai de casa e o celular passa a usar o 4G. Quais tipos de rede o celular usou nessa história?

&nbsp;

**A4**
Infraestrutura de TI: classifique cada item como **Hardware**, **Software**, **Serviço** ou **Espaço**.

| Item | Classificação |
|---|---|
| a) Switch | |
| b) Windows | |
| c) Banco de dados MySQL | |
| d) E-mail da empresa | |
| e) Ar-condicionado da sala de servidores | |
| f) Roteador | |

**A5 ⭐**
Cada item é **cliente-servidor** ou **P2P**?

| Item | Cliente-servidor ou P2P? |
|---|---|
| a) Netflix | |
| b) Torrent | |
| c) App do banco | |
| d) Site da escola | |
| e) Mandar um arquivo direto de um PC para outro PC | |

E responda: no cliente-servidor, o que acontece se o **servidor** cair? E no P2P, o que acontece se **um** dos computadores desligar?

&nbsp;

**A6**
O que é um **ISP**? O que é o **backbone**? Qual é o ISP da sua casa ou do seu celular?

&nbsp;

**A7 ⭐**
Você digitou `www.site.com.br` no navegador. Numere os passos de **1 a 7**, na ordem em que acontecem:

```
 (   ) O pedido viaja pelo backbone, passando por vários roteadores
 (   ) O navegador monta e mostra a página
 (   ) O DNS traduz o nome do site para um endereço IP
 (   ) O pedido sai do dispositivo e chega ao roteador de casa
 (   ) O servidor do site processa e envia a resposta
 (   ) Eu digito a URL no navegador
 (   ) O roteador envia o pedido para o ISP
```

**A8 ⭐**
O que o **DNS** faz? Por que ele é chamado de "agenda de contatos da Internet"?

&nbsp;

**A9 ⭐**
Complete as portas: HTTP = ______  HTTPS = ______  MySQL = ______

Na analogia do prédio: o **IP** é ______________________ e a **porta** é ______________________.

**A10 ⭐**
Seu colega programou um site e fala: *"Abre aí no seu computador: `http://localhost:3000`"*.
Você vai ver o site **dele**? Por quê?

&nbsp;

**A11**
Explique com suas palavras:

- a) Latência:
- b) Deploy:
- c) API:

---

## PARTE B — Camada de transporte: UDP e TCP (aula 02)

**B1 ⭐**
Complete a tabela:

| | UDP | TCP |
|---|---|---|
| Abre conexão antes de enviar? | | |
| A entrega é garantida? | | |
| Os dados chegam na ordem certa? | | |
| Um exemplo de uso | | |

**B2 ⭐**
**UDP** ou **TCP**? Justifique em poucas palavras.

| Situação | UDP ou TCP? | Por quê? |
|---|---|---|
| a) Chamada de vídeo ao vivo | | |
| b) Baixar um PDF | | |
| c) Posição dos jogadores num jogo online | | |
| d) Enviar o formulário de matrícula | | |
| e) Uma consulta DNS | | |

**B3 ⭐**
O **three-way handshake** do TCP. Complete com **SYN**, **SYN-ACK** e **ACK**, e escreva o que cada mensagem quer dizer:

```
 Cliente ──(           )──►  Servidor    significa: ______________________
 Cliente ◄──(           )──  Servidor    significa: ______________________
 Cliente ──(           )──►  Servidor    significa: ______________________
```

**B4**
Verdadeiro (**V**) ou Falso (**F**)? **Corrija** as falsas.

```
 (   ) a) O UDP é sempre mais rápido, por isso nunca deve ser usado para nada importante.
 (   ) b) O TCP reenvia os dados que se perderam no caminho.
 (   ) c) No UDP, os dados sempre chegam na mesma ordem em que foram enviados.
 (   ) d) O TCP abre uma conexão antes de começar a enviar os dados.
 (   ) e) A versão mais nova do HTTP (HTTP/3) usa UDP.   ← pode pesquisar
```

**B5**
Numa chamada de vídeo, a fala da pessoa "pulou" um pedaço, em vez de a chamada travar esperando. Por que, nesse tipo de aplicação, é melhor **perder** um pedaço do que **esperar** ele ser reenviado?

&nbsp;

---

## PARTE C — HTTP (aula 02)

**C1 ⭐**
O que é o **HTTP**? Numa comunicação HTTP, quem faz a **requisição** e quem envia a **resposta**?

&nbsp;

**C2**
Qual a diferença entre **HTTP** e **HTTPS**? (Pense na porta, no que aparece no navegador e na segurança.)

&nbsp;

**C3 (pode pesquisar)**
O HTTP é **stateless** ("sem estado"): o servidor não lembra das requisições anteriores. Se é assim, como o site sabe que você continua logado a cada clique?

&nbsp;

**C4 ⭐**
Qual **método HTTP** usar? (GET, POST, PUT, PATCH ou DELETE)

| Ação | Método |
|---|---|
| a) Ver a lista de produtos | |
| b) Cadastrar um aluno novo | |
| c) Mudar **só** o telefone de um aluno | |
| d) Apagar um comentário | |
| e) Substituir o cadastro **inteiro** de um aluno | |

**C5 ⭐**
O primeiro dígito do código de status diz o tipo da resposta. Complete:

```
 2xx = ________________________
 3xx = ________________________
 4xx = ________________________
 5xx = ________________________
```

**C6 ⭐**
Qual **código de status** o servidor deve devolver? Escolha da lista:
`200 • 201 • 204 • 400 • 401 • 403 • 404 • 409 • 429 • 500 • 503`

| Situação | Código |
|---|---|
| a) Pedi o produto `/api/produtos/99999`, que não existe | |
| b) Tentei ver meu perfil sem fazer login | |
| c) Fiz login como aluno e tentei entrar na área do administrador | |
| d) Mandei um JSON com uma vírgula faltando | |
| e) Tem um bug no código do servidor | |
| f) Tentei me cadastrar com um e-mail que já existe | |
| g) Fiz 500 requisições em 1 segundo | |
| h) O servidor está em manutenção | |
| i) Cadastrei um produto novo e deu certo | |
| j) Apaguei um produto, deu certo e não há nada para mostrar | |

**C7 ⭐**
Para cada situação, diga **onde está o problema** (no pedido, no servidor ou na rede) e **o que você faria**:

- a) O app mostra **"Erro 400"**:
- b) O app mostra **"Erro 503"**:
- c) O navegador mostra **"Não foi possível acessar o site"** e não aparece código nenhum:

---

## PARTE D — Lendo URLs e respostas

**D1**
Separe as partes desta URL:
`https://bolsa.fly.dev/api/batatas?setor=doce&precoMax=10`

```
 Protocolo:     ______________________
 Domínio:       ______________________
 Caminho:       ______________________
 Query string:  ______________________
```

O que muda na resposta se eu trocar `setor=doce` por `setor=gourmet`?

**D2**
Uma colega mandou um `POST /api/batatas` e recebeu esta resposta:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": 400,
  "erro": "JSON inválido",
  "mensagem": "O corpo da requisição não é um JSON válido.",
  "dica": "Confira as aspas duplas, as vírgulas e as chaves."
}
```

- a) Deu certo ou deu erro? Como você sabe?
- b) O problema está no pedido dela ou no servidor?
- c) O que ela deve fazer para resolver?

---

## PARTE E — Para o professor (não tem resposta certa)

**E1.** Em qual assunto você se sente **mais seguro**? E **menos seguro**?

&nbsp;

**E2.** Que parte da aula 02 ficou mais confusa? O que você gostaria que fosse explicado de novo?

&nbsp;

---

# Gabarito

Nas questões abertas, a sua resposta não precisa ter as mesmas palavras: o que vale é a ideia. **Atenção** marca os erros mais comuns.

## Parte A — Redes e Internet

**A1.** Dois ou mais dispositivos ligados entre si para **trocar dados** e **compartilhar recursos**. Exemplos: o Wi-Fi de casa, a rede do celular, a rede da escola.

*Atenção:* rede não é só "a internet". A Internet é **uma** rede (a maior de todas), não a definição de rede.

**A2.** a) WLAN (o Wi-Fi é a LAN **sem fio**) • b) WAN • c) PAN • d) LAN • e) MAN

**A3.** Em casa: PAN (Bluetooth) + WLAN (Wi-Fi). Depois de sair: PAN + WAN (4G). O celular usa várias redes **ao mesmo tempo**.

**A4.** a) Hardware • b) Software • c) Software • d) Serviço • e) Espaço • f) Hardware

*Atenção:* o MySQL parece um serviço, mas, no quadro da aula 01, banco de dados está em **software**.

**A5.** a) Cliente-servidor • b) P2P • c) Cliente-servidor • d) Cliente-servidor • e) P2P

Se o servidor cai, **ninguém** consegue usar. No P2P, se um computador desliga, os outros **continuam** funcionando.

**A6.** **ISP** é a empresa que conecta você à Internet (Vivo, Claro, TIM, o provedor de fibra do bairro). **Backbone** são as grandes "rodovias" da Internet: cabos de fibra de altíssima velocidade que ligam cidades, países e continentes. O ISP da sua casa ou do seu celular depende de cada um.

**A7.** De cima para baixo, na ordem em que os passos aparecem na questão: **5 – 7 – 2 – 3 – 6 – 1 – 4**

```
 1. Eu digito a URL no navegador
 2. O DNS traduz o nome do site para um endereço IP
 3. O pedido sai do dispositivo e chega ao roteador de casa
 4. O roteador envia o pedido para o ISP
 5. O pedido viaja pelo backbone, passando por vários roteadores
 6. O servidor do site processa e envia a resposta
 7. O navegador monta e mostra a página
```

*Atenção:* o DNS vem **antes** do roteador e do ISP. Sem o IP, o computador nem sabe para onde mandar o pedido.

**A8.** O DNS traduz o **nome** do site (`www.site.com.br`) para o **endereço IP** (ex.: `200.150.10.5`). É uma "agenda" porque, como na agenda do celular, você procura pelo **nome** e ela te dá o **número**.

**A9.** HTTP = **80** • HTTPS = **443** • MySQL = **3306**. O IP é o **endereço do prédio**, e a porta é o **número do apartamento** (cada programa "mora" numa porta).

**A10.** **Não.** `localhost` (127.0.0.1) é sempre **o próprio computador**. No seu PC, `localhost:3000` procura um programa rodando **na sua máquina**. Como o site do colega está na máquina dele, você vai ver um erro de conexão (ou outro programa seu, se tiver algo nessa porta). Para ver o site dele, você precisaria do **IP** da máquina dele na rede.

**A11.** a) **Latência:** o tempo que o dado leva para ir e voltar (em milissegundos). Latência alta = sistema "lento". • b) **Deploy:** colocar o sistema no ar, num servidor, para outras pessoas acessarem. • c) **API:** o jeito de um programa conversar com outro pela rede (o app pede dados, o servidor responde).

## Parte B — UDP e TCP

**B1.**

| | UDP | TCP |
|---|---|---|
| Abre conexão antes de enviar? | Não | Sim (three-way handshake) |
| A entrega é garantida? | Não | Sim (confirma e reenvia) |
| Os dados chegam na ordem certa? | Não é garantido | Sim |
| Um exemplo de uso | DNS, chamada de vídeo, jogo online | Sites, APIs, e-mail, download |

**B2.** Para decidir, use a pergunta-chave: *se um pedaço se perder, vale a pena esperar ele voltar?* Se não, UDP. Se sim, TCP.

| Situação | UDP ou TCP? | Por quê? |
|---|---|---|
| a) Chamada de vídeo ao vivo | UDP | É ao vivo: esperar o pedaço perdido atrasaria a conversa |
| b) Baixar um PDF | TCP | Não pode faltar nenhum pedaço |
| c) Posição dos jogadores num jogo online | UDP | A posição de 1 segundo atrás já não serve |
| d) Enviar o formulário de matrícula | TCP | Os dados precisam chegar completos e certos |
| e) Uma consulta DNS | UDP | É uma pergunta pequena e rápida: se perder, pergunta de novo |

*Atenção:* "UDP porque é mais rápido" não basta. A justificativa precisa falar de **perda** e **ordem**.

**B3.**

```
 Cliente ──(  SYN      )──►  Servidor    significa: "quero conectar"
 Cliente ◄──(  SYN-ACK  )──  Servidor    significa: "recebi, e eu também quero"
 Cliente ──(  ACK      )──►  Servidor    significa: "confirmado!" (agora vão os dados)
```

*Atenção:* quem começa é o **cliente**, não o servidor.

**B4.**

- a) **F.** O UDP não é sempre mais rápido nem inútil para coisas importantes: o DNS é importantíssimo e usa UDP. Quando a aplicação precisa de garantia, ela mesma cuida disso.
- b) **V.**
- c) **F.** No UDP, os dados **podem** chegar fora de ordem.
- d) **V.**
- e) **V.** O HTTP/3 usa o QUIC, que roda sobre UDP.

**B5.** Porque é **ao vivo**: o pedaço perdido, quando chegasse, já estaria atrasado e não serviria mais. Esperar faria a chamada travar. É melhor seguir com o que está acontecendo **agora**.

## Parte C — HTTP

**C1.** HTTP (HyperText Transfer Protocol) é o protocolo, as "regras da conversa", que sites, apps e APIs usam para trocar dados. O **cliente** (navegador, app) faz a requisição, e o **servidor** envia a resposta.

**C2.** O HTTP usa a porta **80** e manda tudo em **texto aberto**: quem estiver no caminho pode ler. O HTTPS usa a porta **443**, os dados vão **criptografados**, e o navegador mostra o **cadeado**.

**C3.** Em **toda** requisição, o navegador manda junto uma identificação: um **cookie** ou um **token**, que o servidor entregou no login. Assim o servidor "reconhece" você sem precisar lembrar.

**C4.** a) GET • b) POST • c) PATCH • d) DELETE • e) PUT

*Atenção:* o PATCH altera **uma parte** do cadastro (c), e o PUT substitui o cadastro **inteiro** (e).

**C5.** 2xx = sucesso • 3xx = redirecionamento • 4xx = erro do cliente (o pedido está errado) • 5xx = erro do servidor

**C6.** a) 404 • b) 401 • c) 403 • d) 400 • e) 500 • f) 409 • g) 429 • h) 503 • i) 201 • j) 204

*Atenção:* 401 é chegar na portaria **sem crachá** ("quem é você?"). 403 é ter crachá e tentar entrar na sala da diretoria ("sei quem você é, e você não pode"). Na (i), o 200 também é sucesso, mas o mais correto para "criado" é o **201**.

**C7.**

- a) **Erro 400:** o problema está no **pedido** (dado faltando, JSON quebrado). Revise o que foi enviado.
- b) **Erro 503:** o problema está no **servidor** (fora do ar, em manutenção ou sobrecarregado). Mudar o pedido não resolve: espere e tente mais tarde.
- c) **Sem código:** a resposta **nem chegou**, então é problema de **rede**. Confira a internet, se o endereço está certo (DNS) e se o servidor está ligado.

*Atenção:* "não foi possível acessar o site" não é um erro 404. O 404 é uma **resposta** do servidor, e aqui o servidor nem respondeu.

## Parte D — Lendo URLs e respostas

**D1.**

```
 Protocolo:     https
 Domínio:       bolsa.fly.dev
 Caminho:       /api/batatas
 Query string:  setor=doce&precoMax=10
```

Trocando para `setor=gourmet`, a lista passa a mostrar as batatas do setor gourmet (com preço até 10). O recurso é o mesmo: o que muda é o **filtro**.

**D2.**

- a) Deu **erro**: o código é 400 (4xx), e o corpo diz "JSON inválido".
- b) No **pedido** dela (4xx = erro do cliente).
- c) Corrigir o JSON do corpo: conferir as aspas duplas, as vírgulas e as chaves, como diz a `dica`.

## Parte E

Não tem resposta certa: as perguntas E1 e E2 são a sua opinião sobre as aulas.
