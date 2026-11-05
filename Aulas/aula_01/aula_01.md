# Aula 01 — Introdução às redes de computadores
### Conteúdo para o quadro

**Como usar este arquivo**
- Cada **Quadro** é um bloco: escreva → alunos copiam e leem → explique → faça a pergunta de checagem → apague.
- O que está dentro das caixas de código é **exatamente o que vai no quadro**.
- As linhas marcadas com 🗣️ são **só para o professor** (falas, exemplos, perguntas). Não precisam ir para o quadro.
- Sugestão: título de cada quadro e palavras-chave em outra cor.

| Quadro | Tema | Horário previsto |
|:---:|---|:---:|
| 1 | A disciplina e a avaliação | 0h00–0h30 |
| 2 | O que é uma rede de computadores | 0h30–0h50 |
| 3 | Infraestrutura de TI | 0h50–1h05 |
| 4 | Tipos de rede pelo tamanho | 1h05–1h30 |
| 5 | Cliente-servidor × peer-to-peer | 1h30–1h50 |
| — | Intervalo | 1h50–2h05 |
| 6 | A Internet: ISP e backbone | 2h05–2h25 |
| 7 | O que acontece quando digito uma URL? | 2h25–3h00 |
| 8 | Por que o programador precisa entender redes | 3h00–3h20 |
| 9 | Atividade em grupo | 3h20–3h50 |
| 10 | Resumo da aula | 3h50–4h00 |

---

## QUADRO 1 — A disciplina e a avaliação

```
ARQUITETURA DE REDES E INFRAESTRUTURA
Curso: Técnico em Desenvolvimento de Sistemas — 60 h (15 aulas de 4 h)

O QUE VAMOS APRENDER
 • Como as redes funcionam (modelos OSI e TCP/IP)
 • Cabos, equipamentos e endereços IP
 • Montar e testar redes (com cabo e Wi-Fi)
 • Planejar a rede de uma pequena empresa

AVALIAÇÃO (100 pontos)
 • Prova 1 → Aula 05 → 30 pts
 • Prova 2 → Aula 10 → 30 pts
 • Prova 3 → Aula 15 → 30 pts
 • Trabalho final (projeto de rede em grupo) → Aula 15 → 10 pts

DICA: o caderno com o que está no quadro = seu material de estudo!
```

🗣️ **Sondagem (antes de escrever):** "Quem já configurou um roteador em casa?", "Quem sabe o que é um IP?", "O que acontece quando a internet 'cai'?" — anote no canto do quadro as palavras que os alunos falarem e retome-as ao longo da aula.

🗣️ **Checagem:** "Quantas provas temos e quanto vale o trabalho?"

---

## QUADRO 2 — O que é uma rede de computadores?

```
REDE DE COMPUTADORES
= dois ou mais dispositivos ligados entre si
  para TROCAR DADOS e COMPARTILHAR RECURSOS.

Dispositivos: computador, celular, impressora, servidor,
              smart TV, câmera, videogame...

Ligação: com fio (cabo) ou sem fio (Wi-Fi, Bluetooth, 4G/5G)

Para que serve?
 • Compartilhar arquivos e impressoras
 • Acessar a Internet
 • Comunicar (mensagens, chamadas de vídeo)
 • Usar sistemas e bancos de dados de outro lugar

   [PC] ───── [Switch] ───── [Impressora]
                  │
               [Celular]
```

🗣️ **Exemplo:** o WhatsApp só funciona porque o celular faz parte de uma rede — sem rede, o app é só uma tela bonita.

🗣️ **Checagem:** "Dois celulares trocando foto por Bluetooth formam uma rede? Por quê?" (sim — dois dispositivos trocando dados).

---

## QUADRO 3 — Infraestrutura de TI

```
INFRAESTRUTURA DE TI
= tudo o que é necessário para os sistemas funcionarem.

 HARDWARE  → computadores, servidores, switches, roteadores, cabos
 SOFTWARE  → sistemas operacionais, servidores web, bancos de dados
 REDE      → as conexões entre tudo isso
 SERVIÇOS  → Internet, e-mail, nuvem, backup
 ESPAÇO    → sala de servidores / data center, energia, refrigeração

Comparação: a infraestrutura é como as RUAS, a ENERGIA e a ÁGUA
de uma cidade. Ninguém vê, mas sem ela nada funciona.
```

🗣️ **Exemplo:** o app do banco é o "prédio"; a infraestrutura é a rua, a energia e o encanamento que deixam o prédio funcionando.

🗣️ **Checagem:** "Um cabo de rede é hardware, software ou serviço?"

---

## QUADRO 4 — Tipos de rede pelo tamanho (abrangência)

```
TIPOS DE REDE (do menor para o maior)

 SIGLA │ NOME                           │ ALCANCE          │ EXEMPLO
───────┼────────────────────────────────┼──────────────────┼──────────────────────────
 PAN   │ Personal Area Network          │ poucos metros    │ celular + fone Bluetooth
 LAN   │ Local Area Network             │ casa, sala,      │ computadores do laboratório
       │                                │ prédio           │
 MAN   │ Metropolitan Area Network      │ uma cidade       │ rede que liga as escolas
       │                                │                  │ de uma prefeitura
 WAN   │ Wide Area Network              │ países,          │ a INTERNET
       │                                │ continentes      │

 WLAN = Wireless LAN → uma LAN SEM FIO (o Wi-Fi da sua casa)

 PAN  <  LAN  <  MAN  <  WAN
```

🗣️ **Dica de memória:** P = Pessoal, L = Local, M = Metropolitana (cidade), W = *Wide* (larga, mundo).

🗣️ **Checagem:** "O Wi-Fi da escola é que tipo de rede?" (WLAN, que é um tipo de LAN). "E um smartwatch ligado ao celular?" (PAN).

---

## QUADRO 5 — Como os computadores se organizam na rede

```
1) CLIENTE-SERVIDOR
   • CLIENTE → pede algo (navegador, app no celular)
   • SERVIDOR → responde / oferece o serviço (site, API, banco de dados)

      [Cliente] ── pedido ──►  [Servidor]
      [Cliente] ◄─ resposta ── [Servidor]

   Ex.: Instagram, Netflix, sites, sistemas de banco

2) PEER-TO-PEER (P2P) — "par a par"
   • Todos são iguais: cada um é cliente E servidor ao mesmo tempo
   • Não depende de um servidor central

      [PC A] ◄──► [PC B]
         ▲          ▲
          └──►[PC C]◄┘

   Ex.: torrent, compartilhamento de arquivos entre PCs, alguns jogos

               │ CLIENTE-SERVIDOR        │ P2P
 ──────────────┼─────────────────────────┼────────────────────────
 Controle      │ centralizado            │ distribuído
 Se o servidor │ tudo para               │ o resto continua
 cair...       │                         │ funcionando
 Mais usado em │ sistemas e apps         │ troca de arquivos
```

🗣️ **Gancho para o curso:** "Quase todo sistema que vocês vão programar é cliente-servidor: o front-end é o cliente, a API/back-end é o servidor."

🗣️ **Checagem:** "Quando você abre o YouTube, seu celular é cliente ou servidor?"

---

## — INTERVALO (1h50–2h05) —

---

## QUADRO 6 — A Internet

```
INTERNET = uma "rede de redes" que liga o mundo inteiro.

ISP (Provedor de Internet) → a empresa que te conecta à Internet
   Ex.: Vivo, Claro, TIM, provedores de fibra do bairro

BACKBONE ("espinha dorsal") → as grandes "rodovias" da Internet
   • Cabos de fibra óptica de altíssima velocidade
   • Ligam cidades, países e continentes
   • Inclui cabos SUBMARINOS no fundo do oceano!

 [Sua casa] → [ISP] → [BACKBONE] → [ISP do site] → [Servidor do site]
   (LAN)                (WAN)                         (data center)
```

🗣️ **Curiosidade:** a maior parte do tráfego entre continentes passa por cabos submarinos, não por satélite. Se possível, mostre o site *submarinecablemap.com* no projetor.

🗣️ **Checagem:** "Qual é o ISP da casa de vocês?"

---

## QUADRO 7 — O que acontece quando digito uma URL?

🗣️ **Dinâmica (antes de escrever):** pergunte "O que acontece desde que eu digito `www.google.com` até a página aparecer?". Deixe a turma propor os passos, escreva as ideias no quadro como rascunho, corrija e organize junto com eles. No fim, passe a limpo a versão abaixo para copiarem.

```
O CAMINHO DE UMA REQUISIÇÃO  (ex.: digitei www.site.com.br)

 1. Digito a URL no navegador.
 2. DNS: o nome "www.site.com.br" é traduzido para um
    endereço IP (ex.: 200.150.10.5) → é a "agenda de contatos" da Internet.
 3. O pedido sai do meu dispositivo pelo Wi-Fi ou cabo
    e vai até o ROTEADOR de casa.
 4. O roteador envia para o ISP (provedor).
 5. O pedido viaja pelo BACKBONE, passando por vários roteadores.
 6. Chega ao SERVIDOR do site (em um data center).
 7. O servidor processa e envia a RESPOSTA (a página: HTML, imagens...).
 8. A resposta faz o caminho de volta.
 9. O navegador monta e mostra a página.

 Tudo isso acontece em MILISSEGUNDOS!

 [Navegador] → [Roteador] → [ISP] → [Backbone] → [Servidor]
      ▲                                              │
      └──────────────── resposta ◄───────────────────┘
```

🗣️ **Ligação com as próximas aulas:** "Cada passo desse vamos estudar em detalhe: IP (aulas 06–07), roteador (aula 04), DNS (aula 12)."

🗣️ **Checagem:** "Quem traduz o nome do site para um número IP?" (DNS).

---

## QUADRO 8 — Por que o programador precisa entender redes?

```
O SISTEMA QUE VOCÊ PROGRAMA VIVE EM UMA REDE!

 • API → um programa conversa com outro PELA REDE
   (o app pede dados para o servidor e recebe a resposta)

 • LATÊNCIA → tempo que o dado leva para ir e voltar
   (medido em milissegundos — ms). Latência alta = sistema "lento"

 • PORTA → "número da porta" do programa dentro do servidor
     80   = HTTP (site)
     443  = HTTPS (site seguro)
     3306 = MySQL (banco de dados)
     3000 / 8080 = muito usadas em desenvolvimento

 • LOCALHOST (127.0.0.1) → o PRÓPRIO computador
   Ex.: http://localhost:3000 = seu sistema rodando na sua máquina

 • DEPLOY → colocar o sistema "no ar", em um servidor,
   para outras pessoas acessarem pela rede

"Na minha máquina funciona!" → muitas vezes o problema é de REDE.
```

🗣️ **Analogia de porta:** o IP é o endereço do prédio; a porta é o número do apartamento. Cada programa "mora" em um apartamento diferente.

🗣️ **Checagem:** "Se eu acesso `localhost:8080`, estou acessando qual computador?"

---

## QUADRO 9 — Atividade em grupo

```
ATIVIDADE EM GRUPO (3 a 4 alunos) — 25 min

Pensem nas redes que existem no dia a dia de vocês:
  CASA • ESCOLA • CELULAR • UMA EMPRESA (ex.: supermercado, banco)

Para CADA ambiente, respondam:
 1. Quais dispositivos fazem parte da rede?
 2. É com fio, sem fio ou os dois?
 3. Que tipo de rede é? (PAN, LAN, WLAN, MAN ou WAN)
 4. Tem algum servidor? Ele está no local ou na Internet?
 5. É cliente-servidor ou P2P?

Entregar em uma folha com o nome do grupo.
```

🗣️ **Fechamento da atividade:** peça para 2 ou 3 grupos lerem uma resposta e corrija coletivamente (ponto comum de confusão: o celular usa PAN — Bluetooth, WLAN — Wi-Fi e WAN — 4G/5G, tudo ao mesmo tempo).

---

## QUADRO 10 — Resumo da aula

```
RESUMO DA AULA 01

 ✔ REDE = dispositivos ligados para trocar dados e compartilhar recursos
 ✔ INFRAESTRUTURA DE TI = hardware + software + rede + serviços + espaço
 ✔ TIPOS: PAN < LAN < MAN < WAN    (WLAN = LAN sem fio)
 ✔ CLIENTE-SERVIDOR (central) × P2P (todos iguais)
 ✔ INTERNET = rede de redes → ISP + BACKBONE
 ✔ URL → DNS → roteador → ISP → backbone → servidor → resposta
 ✔ DEV precisa saber: API, latência, porta, localhost, deploy

PRÓXIMA AULA: Modelos OSI e TCP/IP (as "camadas" da rede)

LEITURA: Kurose & Ross — Redes de Computadores e a Internet, Cap. 1
```

🗣️ **Pergunta final para a saída:** "Qual foi a coisa mais nova que você aprendeu hoje?" (pode ser respondida oralmente por alguns alunos).
