# Atividade — O que ficou das aulas 01 e 02?

> Versão para imprimir: `atividade_aluno.pdf` (gerado a partir de `atividade_aluno.html`).

**Nome ou apelido:** ______________________________  **Data:** ____/____/______

---

### ISTO NÃO É PROVA

Não vale nota. Serve para o professor saber **o que ficou claro e o que precisa ser explicado de novo**.

- Você **pode** usar o caderno, a colinha, a internet e conversar com o colega.
- Mas escreva a resposta **com as suas palavras** (copiar e colar da internet não ajuda ninguém).
- Comece pelas questões marcadas com ⭐. Se sobrar tempo, faça as outras.
- Ao lado de **cada** questão, marque **como você respondeu**:

```
 [S] Sabia de cabeça
 [C] Consultei o caderno ou a colinha
 [P] Pesquisei na internet
 [?] Chutei / não sei
```

> Marcar **[?]** não é ruim. É a informação mais útil para o professor.

---

## PARTE A — Redes e Internet (aula 01)

**A1 ⭐** `[ S | C | P | ? ]`
Com suas palavras: o que é uma rede de computadores? Cite uma rede que você usou hoje.

&nbsp;

**A2 ⭐** `[ S | C | P | ? ]`
Escreva o tipo de rede (**PAN, LAN, WLAN, MAN** ou **WAN**) de cada situação:

| Situação | Tipo de rede |
|---|---|
| a) O Wi-Fi da sua casa | |
| b) A Internet | |
| c) Um fone Bluetooth ligado ao celular | |
| d) Os computadores do laboratório ligados por cabo | |
| e) Uma rede que liga todas as escolas de uma prefeitura | |

**A3** `[ S | C | P | ? ]`
Você está ouvindo música num fone Bluetooth, com o celular no Wi-Fi de casa. Aí você sai de casa e o celular passa a usar o 4G. Quais tipos de rede o celular usou nessa história?

&nbsp;

**A4** `[ S | C | P | ? ]`
Infraestrutura de TI: classifique cada item como **Hardware**, **Software**, **Serviço** ou **Espaço**.

| Item | Classificação |
|---|---|
| a) Switch | |
| b) Windows | |
| c) Banco de dados MySQL | |
| d) E-mail da empresa | |
| e) Ar-condicionado da sala de servidores | |
| f) Roteador | |

**A5 ⭐** `[ S | C | P | ? ]`
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

**A6** `[ S | C | P | ? ]`
O que é um **ISP**? O que é o **backbone**? Qual é o ISP da sua casa ou do seu celular?

&nbsp;

**A7 ⭐** `[ S | C | P | ? ]`
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

**A8 ⭐** `[ S | C | P | ? ]`
O que o **DNS** faz? Por que ele é chamado de "agenda de contatos da Internet"?

&nbsp;

**A9 ⭐** `[ S | C | P | ? ]`
Complete as portas: HTTP = ______  HTTPS = ______  MySQL = ______

Na analogia do prédio: o **IP** é ______________________ e a **porta** é ______________________.

**A10 ⭐** `[ S | C | P | ? ]`
Seu colega programou um site e fala: *"Abre aí no seu computador: `http://localhost:3000`"*.
Você vai ver o site **dele**? Por quê?

&nbsp;

**A11** `[ S | C | P | ? ]`
Explique com suas palavras:
- a) Latência:
- b) Deploy:
- c) API:

---

## PARTE B — Camada de transporte: UDP e TCP (aula 02)

**B1 ⭐** `[ S | C | P | ? ]`
Complete a tabela:

| | UDP | TCP |
|---|---|---|
| Abre conexão antes de enviar? | | |
| A entrega é garantida? | | |
| Os dados chegam na ordem certa? | | |
| Um exemplo de uso | | |

**B2 ⭐** `[ S | C | P | ? ]`
**UDP** ou **TCP**? Justifique em poucas palavras.

| Situação | UDP ou TCP? | Por quê? |
|---|---|---|
| a) Chamada de vídeo ao vivo | | |
| b) Baixar um PDF | | |
| c) Posição dos jogadores num jogo online | | |
| d) Enviar o formulário de matrícula | | |
| e) Uma consulta DNS | | |

**B3 ⭐** `[ S | C | P | ? ]`
O **three-way handshake** do TCP. Complete com **SYN**, **SYN-ACK** e **ACK**, e escreva o que cada mensagem quer dizer:

```
 Cliente ──(           )──►  Servidor    significa: ______________________
 Cliente ◄──(           )──  Servidor    significa: ______________________
 Cliente ──(           )──►  Servidor    significa: ______________________
```

**B4** `[ S | C | P | ? ]`
Verdadeiro (**V**) ou Falso (**F**)? **Corrija** as falsas.

```
 (   ) a) O UDP é sempre mais rápido, por isso nunca deve ser usado para nada importante.
 (   ) b) O TCP reenvia os dados que se perderam no caminho.
 (   ) c) No UDP, os dados sempre chegam na mesma ordem em que foram enviados.
 (   ) d) O TCP abre uma conexão antes de começar a enviar os dados.
 (   ) e) A versão mais nova do HTTP (HTTP/3) usa UDP.   ← pode pesquisar
```

**B5** `[ S | C | P | ? ]`
Numa chamada de vídeo, a fala da pessoa "pulou" um pedaço, em vez de a chamada travar esperando. Por que, nesse tipo de aplicação, é melhor **perder** um pedaço do que **esperar** ele ser reenviado?

&nbsp;

---

## PARTE C — HTTP (aula 02)

**C1 ⭐** `[ S | C | P | ? ]`
O que é o **HTTP**? Numa comunicação HTTP, quem faz a **requisição** e quem envia a **resposta**?

&nbsp;

**C2** `[ S | C | P | ? ]`
Qual a diferença entre **HTTP** e **HTTPS**? (Pense na porta, no que aparece no navegador e na segurança.)

&nbsp;

**C3 (pode pesquisar)** `[ S | C | P | ? ]`
O HTTP é **stateless** ("sem estado"): o servidor não lembra das requisições anteriores. Se é assim, como o site sabe que você continua logado a cada clique?

&nbsp;

**C4 ⭐** `[ S | C | P | ? ]`
Qual **método HTTP** usar? (GET, POST, PUT, PATCH ou DELETE)

| Ação | Método |
|---|---|
| a) Ver a lista de produtos | |
| b) Cadastrar um aluno novo | |
| c) Mudar **só** o telefone de um aluno | |
| d) Apagar um comentário | |
| e) Substituir o cadastro **inteiro** de um aluno | |

**C5 ⭐** `[ S | C | P | ? ]`
O primeiro dígito do código de status diz o tipo da resposta. Complete:

```
 2xx = ________________________
 3xx = ________________________
 4xx = ________________________
 5xx = ________________________
```

**C6 ⭐** `[ S | C | P | ? ]`
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

**C7 ⭐** `[ S | C | P | ? ]`
Para cada situação, diga **onde está o problema** (no pedido, no servidor ou na rede) e **o que você faria**:

- a) O app mostra **"Erro 400"**:
- b) O app mostra **"Erro 503"**:
- c) O navegador mostra **"Não foi possível acessar o site"** e não aparece código nenhum:

---

## PARTE D — Lendo URLs e respostas

**D1** `[ S | C | P | ? ]`
Separe as partes desta URL:
`https://bolsa.fly.dev/api/batatas?setor=doce&precoMax=10`

```
 Protocolo:     ______________________
 Domínio:       ______________________
 Caminho:       ______________________
 Query string:  ______________________
```

O que muda na resposta se eu trocar `setor=doce` por `setor=gourmet`?

**D2** `[ S | C | P | ? ]`
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
