# Plano de Ensino — Arquitetura de Redes e Infraestrutura

| | |
|---|---|
| **Curso** | Técnico em Desenvolvimento de Sistemas |
| **Disciplina** | Arquitetura de Redes e Infraestrutura |
| **Carga horária** | 60 h (15 encontros de 4 h) |
| **Avaliação** | 3 provas (30 pts cada) + trabalho final (10 pts) = **100 pts** |

---

## 1. Ementa

Fundamentos de redes de computadores e de infraestrutura de TI aplicados ao desenvolvimento de sistemas. Modelos de referência OSI e TCP/IP. Tipos de redes, topologias, meios de transmissão e endereçamento IP (IPv4 e noções de IPv6). Equipamentos de rede: NIC, switch, roteador e access points. Cabeamento estruturado: normas, conectores, patch panels e certificação básica de cabos. Redes locais (LAN) e sem fio (Wi-Fi): configuração introdutória e testes de conectividade. Protocolos e serviços essenciais: Ethernet, DNS e DHCP (conceitos). Ferramentas de diagnóstico: ping, traceroute e analisadores introdutórios. Projeto básico de infraestrutura de rede para pequenos ambientes corporativos. Noções de virtualização e computação em nuvem como contexto de infraestrutura. Introdução à segurança de redes no plano arquitetural, sem aprofundamento em políticas de segurança da informação ou pentest. Aplicação dos conceitos ao entendimento de sistemas distribuídos e ambientes de desenvolvimento.

## 2. Objetivos

**Geral:** Capacitar o estudante a compreender, configurar e planejar redes de computadores de pequeno porte, relacionando a infraestrutura ao desenvolvimento e à operação de sistemas.

**Específicos:**
1. Compreender os modelos OSI e TCP/IP, as topologias e os componentes de redes de computadores;
2. Identificar meios de transmissão, equipamentos e padrões de cabeamento estruturado;
3. Configurar e testar redes locais cabeadas e sem fio em ambiente laboratorial;
4. Aplicar endereçamento IP e ferramentas de diagnóstico de conectividade;
5. Elaborar projeto básico de infraestrutura de rede para ambientes de pequeno porte;
6. Relacionar arquitetura de redes ao desenvolvimento e à operação de sistemas de informação.

---

## 3. Visão geral do cronograma

| Aula | Unidade | Tema principal | Objetivos |
|:---:|:---:|---|:---:|
| 01 | I | Introdução às redes, tipos de redes e redes no desenvolvimento de sistemas | 1, 6 |
| 02 | I | UDP × TCP e HTTP (prática com API REST) | 1, 6 |
| 03 | I | Atividade de diagnóstico + revisão das aulas 01 e 02 (reforço) | 1, 6 |
| 04 | I | Topologias, meios de transmissão e Ethernet | 1, 2 |
| 05 | I | Revisão + **PROVA 1 (30 pts)** + lançamento do trabalho final | — |
| 06 | II | Endereçamento IPv4 | 4 |
| 07 | II | Máscaras, sub-redes (CIDR) e noções de IPv6 | 4 |
| 08 | II | Modelos OSI e TCP/IP e equipamentos de rede (Packet Tracer) | 1, 2, 3 |
| 09 | II | Cabeamento estruturado e montagem/testes de LAN cabeada (laboratório) | 2, 3, 4 |
| 10 | II | Revisão + **PROVA 2 (30 pts)** + orientação do trabalho final | — |
| 11 | III | Redes sem fio (Wi-Fi): conceitos e configuração | 3 |
| 12 | III | Serviços essenciais (DHCP e DNS) e ferramentas de diagnóstico | 4, 6 |
| 13 | III | Virtualização, nuvem, sistemas distribuídos e segurança arquitetural | 6 |
| 14 | III | Projeto básico de infraestrutura + oficina do trabalho final + revisão | 5 |
| 15 | III | **PROVA 3 (30 pts)** + **apresentação do trabalho final (10 pts)** | — |

**Distribuição da carga horária**

| Atividade | Horas |
|---|:---:|
| Aulas teóricas e expositivo-dialogadas | 24 h |
| Atividades práticas / laboratório | 19 h |
| Revisões, atividade de diagnóstico e orientação do trabalho final | 9 h |
| Provas (3 × 2 h) | 6 h |
| Apresentação do trabalho final | 2 h |
| **Total** | **60 h** |

---

## 4. Detalhamento das aulas

### UNIDADE I — Fundamentos de redes (Aulas 01 a 05)

#### Aula 01 — Introdução às redes de computadores
**Objetivo da aula:** Apresentar a disciplina e compreender o que é uma rede, seus tipos e sua importância para quem desenvolve sistemas.

**Conteúdos:**
- Apresentação da disciplina, do plano de ensino e dos critérios de avaliação
- Conceito de rede de computadores e de infraestrutura de TI
- Classificação por abrangência: PAN, LAN, MAN, WAN (e WLAN)
- Arquiteturas cliente-servidor e peer-to-peer
- A Internet: ISPs, backbone, noção de “caminho” de uma requisição
- Por que o desenvolvedor precisa entender redes (APIs, latência, portas, deploy, localhost)

| Tempo | Atividade |
|---|---|
| 0h00–0h30 | Acolhida e sondagem de conhecimentos prévios; **Quadro 1** — a disciplina e a avaliação |
| 0h30–1h50 | Ciclos de quadro (escrever → copiar → explicar → checar): **Quadro 2** (o que é rede), **Quadro 3** (infraestrutura de TI), **Quadro 4** (tipos de rede), **Quadro 5** (cliente-servidor × P2P) |
| 1h50–2h05 | Intervalo |
| 2h05–2h25 | **Quadro 6** — a Internet: ISP e backbone |
| 2h25–3h00 | Dinâmica: “O que acontece quando digito uma URL?” — mapeamento coletivo; ao final, registro do **Quadro 7** |
| 3h00–3h20 | **Quadro 8** — por que o desenvolvedor precisa entender redes |
| 3h20–3h50 | Atividade em grupo (**Quadro 9**): identificar e classificar as redes presentes no cotidiano (casa, escola, celular, empresa) |
| 3h50–4h00 | Síntese (**Quadro 10**) e indicação de leitura |

**Registro no quadro:** conteúdo completo dos quadros em `aula_01.md`.
**Recursos:** projetor, quadro (pincéis de pelo menos 2 cores), internet.
**Avaliação formativa:** participação e entrega da atividade em grupo.

---

#### Aula 02 — UDP × TCP e HTTP (planejada com Modelos OSI e TCP/IP; ver observação)
**Objetivo da aula:** Compreender, em visão geral, a organização da rede em camadas e o encapsulamento; diferenciar TCP e UDP; entender o funcionamento do HTTP e fazer requisições reais a uma API REST usando diferentes ferramentas.

**Conteúdos:**
- Por que modelos em camadas? Padronização e interoperabilidade
- Modelos OSI (7 camadas) e TCP/IP (4 camadas): correspondência e protocolos de exemplo — abordagem leve (o OSI é só referência e não é cobrado em prova)
- Encapsulamento: explicado oralmente a partir de uma colinha do professor, sem registro no quadro
- Portas; UDP × TCP; three-way handshake
- HTTP: cliente-servidor, requisição e resposta, stateless, versões (1.1, 2, 3/QUIC)
- Métodos HTTP (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) e tipos de erro (4xx, 5xx e erro de rede sem código)
- Anatomia da URL e da mensagem HTTP; REST e CRUD; respostas de sucesso e redirecionamento; cabeçalhos
- API REST e JSON; autenticação com token (401 × 403); HTTPS e TLS (noção de chave simétrica e assimétrica)
- Prática: requisições a uma API REST de teste com navegador/DevTools, Swagger UI, cliente HTTP gráfico e `curl`

| Tempo | Atividade |
|---|---|
| 0h00–0h10 | Retomada da aula anterior (o caminho de uma URL) |
| 0h10–1h45 | Ciclos de quadro: 
**Quadro 1** (por que camadas — analogia da encomenda),
**Quadro 2** (OSI × TCP/IP, com explicação oral do encapsulamento),
**Quadro 3** (UDP × TCP), **Quadro 4** (HTTP),
**Quadro 5** (métodos HTTP e erros HTTP) |
| 1h45–2h00 | Intervalo |
| 2h00–2h15 | **Quadro 6** — anatomia da URL e da mensagem HTTP (demonstração nas DevTools) |
| 2h15–2h35 | Prática 1: navegador + DevTools na API de teste |
| 2h35–2h50 | **Quadro 7** — API REST, CRUD e respostas de sucesso |
| 2h50–3h35 | Prática 2 (duplas): CRUD na API com Swagger UI, cliente HTTP gráfico e `curl` |
| 3h35–3h55 | **Quadro 8** (cabeçalhos, autenticação e HTTPS) + Prática 3: token, 401 × 403 |
| 3h55–4h00 | Síntese (**Quadro 9**) |

**Registro no quadro:** conteúdo completo dos quadros em `Aulas/aula_02/Aula_02_v2.md`.
**Roteiro da prática:** `Aulas/aula_02/Segunda_metade_recomendacao.md` (especificação da API em `Aulas/aula_02/Pratica.md`).
**Recursos:** projetor, quadro, laboratório com internet, navegador, `curl`, cliente HTTP gráfico (Postman, Insomnia ou Bruno), API REST de teste hospedada no Fly.io (TypeScript + Fastify, com Swagger UI).
**Avaliação formativa:** ficha de requisições preenchida na prática.

> **Observação (como a aula foi dada):** foram trabalhados UDP × TCP, HTTP, métodos e erros HTTP, e a prática na API. **Não foram dados:** modelos OSI e TCP/IP (com o encapsulamento), criptografia (chaves simétrica e assimétrica no HTTPS) e o funcionamento do QUIC. OSI/TCP-IP e encapsulamento passam para a **Aula 08**, junto com equipamentos de rede e a demonstração no Packet Tracer; a noção de criptografia no HTTPS passa para a **Aula 13** (segurança arquitetural). Como a aula ficou corrida, a Aula 03 virou uma aula de reforço.

---

#### Aula 03 — Atividade de diagnóstico e revisão (reforço das aulas 01 e 02)
**Objetivo da aula:** Verificar o que a turma absorveu das aulas 01 e 02 e reforçar os pontos com mais dúvida antes de seguir com conteúdo novo.

**Conteúdos (revisão):**
- Redes: conceito, infraestrutura de TI, PAN/LAN/WLAN/MAN/WAN, cliente-servidor × P2P
- Internet: ISP, backbone, o caminho de uma URL, DNS, portas, `localhost`, latência, deploy, API
- UDP × TCP e three-way handshake
- HTTP: requisição e resposta, stateless, HTTP × HTTPS, métodos, códigos de status e tipos de erro (4xx, 5xx e erro de rede)
- Prática na API REST de teste (Bolsa de Batatas)
- **Fora da atividade:** OSI/TCP-IP, criptografia e QUIC, que não foram dados

| Tempo | Atividade |
|---|---|
| 0h00–0h10 | Abertura e combinados: não é prova, consulta liberada, marcação [S] sabia / [C] caderno / [P] pesquisei / [?] não sei |
| 0h10–1h40 | Atividade individual com consulta (caderno, colinha, internet): partes A (redes), B (UDP × TCP), C (HTTP), D (prática na API) e E (autoavaliação) |
| 1h40–2h00 | Termômetro da turma: cada aluno marca no quadro as 3 questões em que se sentiu menos seguro |
| 2h00–2h15 | Intervalo (o professor lê o termômetro e define as prioridades da revisão) |
| 2h15–3h35 | Revisão e correção comentada em 3 quadros (R1 redes, R2 UDP × TCP, R3 HTTP), com mais tempo para o que o termômetro apontou; os alunos corrigem a própria folha com caneta de outra cor |
| 3h35–3h50 | Ticket de saída: 5 questões sem consulta |
| 3h50–4h00 | Fechamento e entrega das folhas |

**Registro no quadro e gabarito:** `Aulas/aula_03/aula_03.md`.
**Folha do aluno:** `Aulas/aula_03/atividade_aluno.md`.
**Recursos:** folha impressa (uma por aluno), canetas de outra cor, laboratório com internet e API de teste no ar (opcional, para a parte D).
**Avaliação formativa:** folha da atividade (marcações e correção) + ticket de saída. Os resultados orientam a revisão da Aula 05.

---

#### Aula 04 — Topologias, meios de transmissão e Ethernet
**Objetivo da aula:** Identificar topologias físicas e lógicas, os principais meios de transmissão e o funcionamento básico da Ethernet.

**Conteúdos:**
- Topologias: barramento, anel, estrela, estrela estendida, malha, híbrida; física × lógica
- Meios guiados: par trançado (UTP/STP, categorias), cabo coaxial, fibra óptica (mono e multimodo)
- Meios não guiados: radiofrequência, micro-ondas, infravermelho
- Comparação: velocidade, distância, custo, interferência
- Ethernet: padrão IEEE 802.3, endereço MAC, estrutura do quadro, CSMA/CD (conceito), velocidades (Fast, Gigabit, 10G)

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Devolutiva da atividade da Aula 03 |
| 0h15–1h30 | Exposição: topologias e meios de transmissão |
| 1h30–1h45 | Intervalo |
| 1h45–2h30 | Prática: manuseio e identificação de amostras de cabos e conectores (UTP, STP, coaxial, fibra) |
| 2h30–3h15 | Exposição: Ethernet e endereço MAC; prática `ipconfig /all` / `ip link` para localizar o MAC |
| 3h15–3h50 | Estudo de caso: escolher meio de transmissão e topologia para três cenários |
| 3h50–4h00 | Síntese |

**Recursos:** amostras de cabos/conectores, computadores do laboratório.
**Avaliação formativa:** estudo de caso.

> **Observação:** esta aula era a Aula 03; passou para cá por causa da aula de reforço. Equipamentos de rede (que era a Aula 04) foi para a Unidade II (Aula 08) e passou a ser cobrado na Prova 2.

---

#### Aula 05 — Revisão e PROVA 1
**Conteúdos avaliados:** Aulas 01 a 04 (tipos de redes, Internet e caminho de uma requisição, DNS, portas e `localhost`, UDP × TCP, fundamentos de HTTP — métodos, códigos de status e tipos de erro —, topologias, meios de transmissão e Ethernet). **Não caem:** modelos OSI/TCP-IP e equipamentos de rede (Prova 2).

| Tempo | Atividade |
|---|---|
| 0h00–1h20 | Revisão orientada: resolução de questões no estilo da prova, priorizando os pontos fracos apontados na atividade da Aula 03; tira-dúvidas |
| 1h20–1h30 | Intervalo |
| 1h30–3h30 | **PROVA 1 — 30 pontos** |
| 3h30–4h00 | Lançamento do **trabalho final**: apresentação do enunciado, rubrica e formação dos grupos |

---

### UNIDADE II — Endereçamento, camadas, equipamentos, cabeamento e LAN (Aulas 06 a 10)

#### Aula 06 — Endereçamento IPv4
**Objetivo da aula:** Compreender a estrutura do endereço IPv4 e identificar rede, host e gateway.

**Conteúdos:**
- Revisão de sistema binário e conversão binário ↔ decimal
- Estrutura do IPv4: 32 bits, octetos, porção de rede e de host
- Classes (contexto histórico) e endereços especiais (rede, broadcast, loopback 127.0.0.1)
- Endereços públicos × privados (RFC 1918); noção de NAT
- Máscara de sub-rede e gateway padrão
- Configuração manual de IP em Windows/Linux

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Devolutiva da Prova 1 (correção comentada) |
| 0h15–1h15 | Exposição + exercícios de conversão binária |
| 1h15–1h45 | Exposição: estrutura do IPv4, máscaras, endereços especiais |
| 1h45–2h00 | Intervalo |
| 2h00–3h00 | Exercícios: identificar rede, broadcast, faixa de hosts válidos |
| 3h00–3h50 | Prática: configurar IP estático nos PCs e testar com `ping` |
| 3h50–4h00 | Síntese |

**Avaliação formativa:** lista de exercícios de endereçamento.

---

#### Aula 07 — Sub-redes (CIDR) e noções de IPv6
**Objetivo da aula:** Dividir uma rede em sub-redes e conhecer o IPv6.

**Conteúdos:**
- Notação CIDR (/24, /25, /26…)
- Cálculo de sub-redes: número de sub-redes, hosts por sub-rede, endereços de rede e broadcast
- Planejamento de endereçamento para setores de uma empresa
- IPv6: motivação (esgotamento do IPv4), formato hexadecimal, abreviação, tipos de endereço (unicast, multicast, anycast), link-local
- Pilha dupla (dual stack)

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Retomada |
| 0h15–1h30 | Exposição e exemplos resolvidos de sub-redes |
| 1h30–1h45 | Intervalo |
| 1h45–2h50 | Exercícios progressivos de sub-redes (individual e em duplas) |
| 2h50–3h40 | Exposição: IPv6 + exercícios de abreviação de endereços |
| 3h40–4h00 | Desafio: plano de endereçamento para uma empresa com 4 setores |

**Recursos:** lista de exercícios; calculadora de sub-redes (para conferência, após cálculo manual).
**Avaliação formativa:** desafio do plano de endereçamento (pode ser aproveitado no trabalho final).

---

#### Aula 08 — Modelos OSI e TCP/IP e equipamentos de rede
**Objetivo da aula:** Compreender a organização da rede em camadas e reconhecer a função de cada equipamento e sua camada de atuação, montando e configurando uma rede no Packet Tracer.

**Conteúdos:**
- Por que modelos em camadas? Padronização e interoperabilidade
- Modelos OSI (7 camadas) e TCP/IP (4 camadas): correspondência e protocolos de exemplo (vindo da Aula 02, que não chegou a dar esse conteúdo)
- Encapsulamento e PDUs (dados, segmento, pacote, quadro, bits)
- NIC (placa de rede cabeada e sem fio)
- Hub × switch: domínio de colisão, tabela MAC, comutação
- Roteador: encaminhamento entre redes, tabela de roteamento (noção), gateway padrão; configuração básica (interfaces, hostname, senha)
- Access point, roteador doméstico “tudo-em-um”, modem/ONT
- Domínios de colisão e de broadcast

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Retomada |
| 0h15–1h00 | Exposição: camadas (OSI × TCP/IP) e encapsulamento, com o material já preparado em `Aulas/aula_02/Aula_02_v2.md` (Quadros 1 e 2 e colinha de encapsulamento) |
| 1h00–1h45 | Exposição: equipamentos e camadas de atuação; domínios de colisão e broadcast |
| 1h45–2h00 | Intervalo |
| 2h00–3h30 | Laboratório (Packet Tracer): topologia em estrela com switch, PCs e roteador; depois, duas LANs interligadas por roteador usando o plano de endereçamento da Aula 07; observar a tabela MAC e abrir um PDU no modo simulação para ver as camadas |
| 3h30–4h00 | Exercício: contar domínios de colisão e broadcast em topologias dadas |

**Recursos:** laboratório com Packet Tracer; se possível, equipamentos físicos para demonstração.
**Avaliação formativa:** arquivo `.pkt` funcional + exercício.

> **Observação:** esta aula reúne o conteúdo de equipamentos (antiga Aula 04, que saiu da Unidade I) com os modelos em camadas (que não foram dados na Aula 02) e a parte de Packet Tracer da antiga aula de configuração de LAN. Vir depois de IPv4 e sub-redes ajuda: o roteador e o gateway padrão já fazem sentido para a turma.

---

#### Aula 09 — Cabeamento estruturado e LAN cabeada
**Objetivo da aula:** Conhecer as normas e os componentes do cabeamento estruturado, confeccionar cabos de rede e usá-los para montar e testar uma LAN física.

**Conteúdos:**
- Conceito e vantagens do cabeamento estruturado
- Normas: ANSI/TIA-568, ISO/IEC 11801 e ABNT NBR 14565
- Subsistemas: entrada de facilities, sala de equipamentos, cabeamento backbone, cabeamento horizontal, área de trabalho
- Componentes: rack, patch panel, keystone, tomadas, patch cords, organizadores
- Padrões de pinagem T568A e T568B; cabo direto e cruzado (e Auto MDI-X)
- Limites de distância (90 m + 10 m)
- Certificação básica: testador de continuidade, mapa de fios (noção de certificador só oral)
- Montagem física de uma LAN e configuração de IP, máscara e gateway nos hosts
- Testes de conectividade: `ping`, `ipconfig`/`ip addr`, `arp -a`
- Roteiro de troubleshooting por camadas (físico → enlace → rede)

| Tempo | Atividade |
|---|---|
| 0h00–0h10 | Retomada |
| 0h10–1h00 | Exposição: normas, subsistemas, componentes e pinagem |
| 1h00–1h50 | Prática: crimpagem de cabo direto (T568B) e teste com testador |
| 1h50–2h05 | Intervalo |
| 2h05–3h05 | Prática física: interligar os PCs do laboratório com os cabos confeccionados, configurar IP e testar com `ping` e `arp -a` |
| 3h05–3h50 | Desafio de troubleshooting por camadas: falhas propositais (cabo ruim, IP/máscara/gateway errados) para os alunos diagnosticarem |
| 3h50–4h00 | Organização do laboratório e síntese |

**Recursos:** cabo UTP Cat5e/Cat6, conectores RJ-45, alicates de crimpagem, decapadores, testadores, switch; se houver tempo, punch down, keystones e patch panel para demonstração.
**Avaliação formativa:** cabo confeccionado e aprovado no teste + relatório curto do troubleshooting.

> **Observação:** esta aula junta as antigas aulas de cabeamento estruturado e de configuração de LAN. Para caber, o cabo cruzado e a conectorização em keystone/patch panel viram demonstração do professor, e a parte de Packet Tracer foi para a Aula 08.

---

#### Aula 10 — Revisão e PROVA 2
**Conteúdos avaliados:** Aulas 06 a 09 (IPv4, sub-redes, IPv6, modelos OSI e TCP/IP, encapsulamento, equipamentos de rede, domínios de colisão e broadcast, cabeamento estruturado, montagem e testes de LAN).

| Tempo | Atividade |
|---|---|
| 0h00–1h20 | Revisão orientada com ênfase em cálculo de sub-redes, camadas e equipamentos, e cabeamento |
| 1h20–1h30 | Intervalo |
| 1h30–3h30 | **PROVA 2 — 30 pontos** |
| 3h30–4h00 | Orientação do trabalho final: checagem do andamento de cada grupo (cenário e levantamento de requisitos) |

---

### UNIDADE III — Serviços, contexto de infraestrutura e projeto (Aulas 11 a 15)

#### Aula 11 — Redes sem fio (Wi-Fi)
**Objetivo da aula:** Compreender o funcionamento das redes sem fio e configurar um ponto de acesso.

**Conteúdos:**
- Padrões IEEE 802.11 (a/b/g/n/ac/ax — Wi-Fi 4, 5, 6/6E, 7)
- Frequências 2,4 GHz, 5 GHz e 6 GHz; canais e interferência
- SSID, modo infraestrutura × ad hoc, roaming
- Segurança no plano arquitetural: WPA2, WPA3, rede de visitantes
- Cobertura: posicionamento de APs, obstáculos, site survey (noção)
- Configuração de roteador/AP sem fio e testes

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Devolutiva da Prova 2 |
| 0h15–1h30 | Exposição: padrões, frequências, canais e segurança |
| 1h30–1h45 | Intervalo |
| 1h45–2h45 | Prática (Packet Tracer): adicionar AP/roteador wireless à LAN, configurar SSID e WPA2/WPA3, conectar notebooks e smartphones |
| 2h45–3h30 | Prática: análise do ambiente Wi-Fi com aplicativo analisador (canais e intensidade de sinal) |
| 3h30–4h00 | Exercício: posicionamento de APs em uma planta baixa |

**Recursos:** roteador/AP físico (se disponível), Packet Tracer, aplicativo analisador de Wi-Fi.
**Avaliação formativa:** exercício da planta baixa.

---

#### Aula 12 — Serviços essenciais (DHCP e DNS) e ferramentas de diagnóstico
**Objetivo da aula:** Compreender DHCP e DNS e usar ferramentas para diagnosticar a conectividade.

**Conteúdos:**
- DHCP: processo DORA, escopo, concessão, reservas
- DNS: hierarquia, resolução recursiva/iterativa, registros (A, AAAA, CNAME, MX), cache, arquivo `hosts`
- Relação com o desenvolvimento: domínios de aplicações, variáveis de ambiente, `localhost`, portas
- Ferramentas: `ping`, `tracert`/`traceroute`, `nslookup`/`dig`, `netstat`/`ss`, `ipconfig /release /renew`
- Analisador de protocolos: introdução ao Wireshark (captura, filtros básicos: `dns`, `dhcp`, `icmp`, `http`)

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Retomada |
| 0h15–1h20 | Exposição: DHCP e DNS |
| 1h20–1h50 | Prática (Packet Tracer): configurar servidor DHCP e DNS na rede da aula 08 |
| 1h50–2h05 | Intervalo |
| 2h05–3h00 | Prática: roteiro com `ping`, `tracert`, `nslookup`, `netstat` em sites reais |
| 3h00–3h45 | Prática: captura no Wireshark — identificar DORA, consulta DNS e requisição HTTP |
| 3h45–4h00 | Síntese |

**Avaliação formativa:** roteiro de diagnóstico preenchido.

---

#### Aula 13 — Virtualização, nuvem, sistemas distribuídos e segurança arquitetural
**Objetivo da aula:** Relacionar a infraestrutura de rede aos ambientes modernos de desenvolvimento e operação de sistemas.

**Conteúdos:**
- Virtualização: hipervisores tipo 1 e tipo 2, máquinas virtuais, redes virtuais (NAT, bridge, host-only)
- Contêineres (noção) e redes de contêineres
- Computação em nuvem: IaaS, PaaS, SaaS; nuvem pública, privada e híbrida; VPC/rede virtual na nuvem (noção)
- Sistemas distribuídos: cliente-servidor em camadas, APIs, balanceamento de carga, CDN, latência
- Ambientes de desenvolvimento, homologação e produção
- Segurança no plano arquitetural: segmentação (VLAN — noção), firewall, DMZ, VPN, princípio do menor privilégio, exposição mínima de portas
- HTTPS e TLS: noção de criptografia simétrica e assimétrica e de certificado digital (vindo da Aula 02, que não chegou a dar esse conteúdo)

| Tempo | Atividade |
|---|---|
| 0h00–0h15 | Retomada |
| 0h15–1h20 | Exposição: virtualização e nuvem |
| 1h20–1h50 | Prática: criar VM no VirtualBox e testar os modos de rede NAT × bridge (ping entre host e VM) |
| 1h50–2h05 | Intervalo |
| 2h05–2h50 | Exposição: sistemas distribuídos e ambientes de desenvolvimento |
| 2h50–3h35 | Exposição: segurança no plano arquitetural |
| 3h35–4h00 | Estudo de caso: desenhar a arquitetura de rede de uma aplicação web (front-end, API, banco de dados) com zonas de segurança |

**Recursos:** VirtualBox, imagem leve de Linux, projetor.
**Avaliação formativa:** desenho do estudo de caso.

---

#### Aula 14 — Projeto básico de infraestrutura de rede
**Objetivo da aula:** Aplicar uma metodologia de projeto de rede para pequenos ambientes corporativos.

**Conteúdos:**
- Etapas do projeto: levantamento de requisitos → análise do ambiente físico → topologia lógica → plano de endereçamento → especificação de equipamentos e cabeamento → serviços → segurança → orçamento
- Documentação: diagrama lógico, diagrama físico/planta, tabela de endereçamento, lista de materiais
- Escalabilidade e redundância básica

| Tempo | Atividade |
|---|---|
| 0h00–1h15 | Exposição: metodologia de projeto + exemplo completo resolvido |
| 1h15–1h30 | Intervalo |
| 1h30–3h00 | Oficina do trabalho final: grupos finalizam o projeto com orientação individualizada |
| 3h00–4h00 | Revisão para a Prova 3 |

---

#### Aula 15 — PROVA 3 e apresentação do trabalho final
**Conteúdos avaliados na Prova 3:** Aulas 11 a 14 (Wi-Fi, DHCP, DNS, ferramentas de diagnóstico, virtualização, nuvem, sistemas distribuídos, segurança arquitetural, projeto de infraestrutura).

| Tempo | Atividade |
|---|---|
| 0h00–2h00 | **PROVA 3 — 30 pontos** |
| 2h00–2h10 | Intervalo |
| 2h10–3h45 | **Apresentação do trabalho final — 10 pontos** (aprox. 10 min por grupo + 3 min de perguntas) |
| 3h45–4h00 | Encerramento da disciplina e avaliação do curso pelos estudantes |

> **Observação:** se a turma tiver muitos grupos, a apresentação pode começar na Aula 14 (no lugar da revisão), e a revisão da Prova 3 passa a ser feita por meio de lista de exercícios para estudo em casa.

---

## 5. Sistema de avaliação

| Instrumento | Conteúdo | Data | Valor |
|---|---|:---:|:---:|
| Prova 1 | Unidade I — Fundamentos: redes, transporte, HTTP, topologias, meios e Ethernet (aulas 01–04) | Aula 05 | 30 pts |
| Prova 2 | Unidade II — Endereçamento, camadas, equipamentos, cabeamento e LAN (aulas 06–09) | Aula 10 | 30 pts |
| Prova 3 | Unidade III — Wi-Fi, serviços, nuvem, segurança e projeto (aulas 11–14) | Aula 15 | 30 pts |
| Trabalho final | Projeto básico de infraestrutura de rede | Aula 15 | 10 pts |
| **Total** | | | **100 pts** |

### 5.1 Estrutura sugerida das provas (2 h cada)

| Parte | Tipo | Pontos |
|---|---|:---:|
| A | 10 questões objetivas (1 pt cada) | 10 |
| B | 3 a 4 questões discursivas/conceituais | 10 |
| C | Questões práticas/de aplicação (ex.: identificar camadas em um cenário, calcular sub-redes, interpretar a saída de `tracert`, diagnosticar uma topologia) | 10 |

Sugestões por prova:
- **Prova 1:** classificação de redes (PAN/LAN/MAN/WAN) e cliente-servidor × P2P; o caminho de uma URL (DNS, portas, `localhost`); UDP × TCP em cenários; leitura de uma requisição/resposta HTTP (método, URL, status) e classificação de erros (4xx, 5xx, erro de rede); escolha de meio de transmissão e topologia para um cenário. A atividade da Aula 03 serve de modelo para o estilo das questões.
- **Prova 2:** cálculo de sub-redes (peso maior na parte C); associação de protocolos e equipamentos às camadas do TCP/IP; contagem de domínios de colisão e broadcast; pinagem T568A/B; subsistemas do cabeamento estruturado; diagnóstico de uma LAN que não se comunica.
- **Prova 3:** processo DORA e resolução DNS; interpretação de saídas de `ping`, `tracert` e `nslookup`; modelos de nuvem; desenho de zonas de segurança de uma aplicação.

### 5.2 Trabalho final — Projeto básico de infraestrutura de rede (10 pts)

**Formato:** grupos de 3 a 5 estudantes.

**Enunciado:** Cada grupo recebe (ou propõe) o cenário de uma pequena empresa — por exemplo, uma clínica, um escritório de contabilidade ou uma software house com 15 a 40 usuários — e deve elaborar um projeto básico de infraestrutura de rede contendo:

1. Levantamento de requisitos (setores, número de usuários e dispositivos, serviços, sistemas utilizados);
2. Topologia lógica e física (diagrama e planta simplificada);
3. Plano de endereçamento IPv4 com sub-redes por setor;
4. Especificação de equipamentos (switches, roteador, APs) e de cabeamento estruturado (categoria, rack, patch panel);
5. Serviços de rede (DHCP, DNS) e cobertura Wi-Fi;
6. Medidas de segurança no plano arquitetural (segmentação, rede de visitantes, firewall);
7. Indicação de uso de nuvem/virtualização, quando pertinente;
8. Simulação funcional no Cisco Packet Tracer;
9. Estimativa de custo dos materiais.

**Entregáveis:** documento (PDF), arquivo `.pkt` e apresentação oral (aprox. 10 min).

**Marcos:**
| Aula | Marco |
|:---:|---|
| 05 | Lançamento do trabalho e formação dos grupos |
| 10 | Checagem: cenário definido e requisitos levantados |
| 14 | Oficina: finalização com orientação |
| 15 | Entrega e apresentação |

**Rubrica de correção:**
| Critério | Pontos |
|---|:---:|
| Levantamento de requisitos e coerência com o cenário | 1,0 |
| Topologia e diagramas (lógico e físico) | 1,5 |
| Plano de endereçamento e sub-redes corretos | 2,0 |
| Especificação de equipamentos e cabeamento estruturado | 1,5 |
| Serviços (DHCP/DNS), Wi-Fi e segurança arquitetural | 1,5 |
| Simulação funcional no Packet Tracer | 1,5 |
| Apresentação oral (clareza, domínio do conteúdo, tempo) | 1,0 |
| **Total** | **10,0** |

### 5.3 Avaliação formativa
As atividades práticas de cada aula (listas, arquivos `.pkt`, cabos confeccionados, roteiros) não valem nota, mas servem para acompanhar a aprendizagem e dar feedback contínuo. A frequência e os critérios de aprovação e recuperação seguem o regimento da instituição.

---

## 6. Metodologia

- Aulas expositivo-dialogadas com uso de analogias e exemplos do dia a dia do desenvolvedor;
- Aulas práticas em laboratório (montagem física e crimpagem) e em simulador (Cisco Packet Tracer);
- Resolução de exercícios individuais e em duplas;
- Estudos de caso e aprendizagem baseada em projeto (trabalho final);
- Revisão orientada antes de cada prova e devolutiva comentada após cada correção;
- **Registro do conteúdo no quadro** como estratégia de ritmo para os encontros de 4 h (ver 6.1).

### 6.1 Estratégia do registro no quadro

Como cada encontro tem 4 h e a turma é formada por estudantes de cerca de 16 anos, a parte expositiva de todas as aulas é organizada em **blocos de quadro** curtos. O objetivo é dar tempo para o aluno ler, copiar e internalizar a informação antes da explicação, alternando momentos de escuta com momentos de registro e evitando longos períodos só de fala do professor.

**Ciclo de cada bloco (≈ 20–30 min):**

| Etapa | O que acontece | Tempo aprox. |
|---|---|:---:|
| 1. Escrever | O professor escreve o bloco no quadro (título, frases curtas, palavras-chave, esquema) | 5–8 min |
| 2. Copiar e ler | Os alunos copiam no caderno e leem com calma; o professor circula pela sala | 5–10 min |
| 3. Explicar | Explicação dialogada a partir do que está no quadro, com exemplos do cotidiano | 8–10 min |
| 4. Checar | 1 ou 2 perguntas rápidas para a turma antes de apagar e seguir para o próximo bloco | 2–3 min |

**Orientações para o quadro:**
- Numerar os blocos (Quadro 1, Quadro 2…) para os alunos organizarem o caderno;
- Frases curtas e diretas; destacar palavras-chave (sublinhado ou outra cor);
- Usar esquemas, setas e tabelas pequenas sempre que possível;
- Cada bloco deve caber no quadro e ser copiado em no máximo ~10 min;
- Só apagar depois que a turma terminar de copiar e da checagem;
- O caderno com os registros do quadro passa a ser o principal material de estudo para as provas.

**Material de apoio:** para cada aula há um arquivo `aula_XX.md` com o conteúdo exato a ser escrito no quadro, já dividido em blocos (ex.: `aula_01.md`).

## 7. Recursos necessários

- **Laboratório:** computadores com Cisco Packet Tracer, Wireshark e VirtualBox instalados;
- **Kit de cabeamento:** cabo UTP Cat5e/Cat6, conectores RJ-45, alicates de crimpagem, decapadores, ferramenta punch down, keystones, patch panel, testadores de cabo;
- **Equipamentos (desejável):** switch, roteador e access point para demonstração;
- **Gerais:** projetor, quadro, acesso à internet.

## 8. Referências

**Básicas**
- KUROSE, James F.; ROSS, Keith W. *Redes de computadores e a Internet: uma abordagem top-down*. 8. ed. São Paulo: Pearson, 2021.
- TANENBAUM, Andrew S.; FEAMSTER, Nick; WETHERALL, David. *Redes de computadores*. 6. ed. Porto Alegre: Bookman, 2021.
- MARIN, Paulo Sérgio. *Cabeamento estruturado: desvendando cada passo — do projeto à instalação*. São Paulo: Érica.

**Complementares**
- ABNT. *NBR 14565: Cabeamento estruturado para edifícios comerciais*. Rio de Janeiro: ABNT.
- TORRES, Gabriel. *Redes de computadores*. Rio de Janeiro: Nova Terra.
- COMER, Douglas E. *Redes de computadores e Internet*. 6. ed. Porto Alegre: Bookman, 2016.
- CISCO NETWORKING ACADEMY. Cursos gratuitos *Networking Basics* e *Packet Tracer*. Disponível em: https://www.netacad.com.
