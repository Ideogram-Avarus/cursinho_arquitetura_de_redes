# Plano de ação — Site da atividade da aula 03

Versão online de `atividade_aluno.md`: os alunos respondem no site (computador ou celular) e o professor acompanha e analisa os resultados numa página própria. O app só existe durante a aula, no Fly.io, **sem volume**: tudo o que importa sai pelo botão de exportar.

O PDF (`atividade_aluno.pdf`) continua sendo o plano B se a rede da escola falhar.

---

## 1. Decisões

| Tema | Decisão | Por quê |
|---|---|---|
| Onde fica | `Aulas/aula_03/atividade_online/` | Separado da aula 02, mas copia a base dela (Dockerfile, scripts do Fly, Prisma + SQLite) |
| Front | React + TypeScript + Vite + Tailwind | Pedido do professor |
| Tema visual | **Material 3** (Material You): as cores são geradas a partir de uma cor-semente com `@material/material-color-utilities` e viram variáveis CSS que o Tailwind usa (`bg-primary`, `text-on-surface`…), com claro e escuro | Visual Material feito só com Tailwind: sem MUI e sem outra biblioteca de componentes |
| Back | Fastify 5 + Prisma 7 + SQLite, igual à aula 02 | Já está testado no Fly, e os alunos já viram essa API |
| Deploy | **Um app só**: o Fastify serve a API em `/api` e o front compilado (`dist/web`) | Um deploy, uma URL, sem CORS |
| Banco | SQLite dentro da máquina, sem volume | O banco morre com o app. O **exportar** é o que guarda os dados |
| Proteção dos dados | Exportar JSON/CSV + **importar** o JSON | Se a máquina reiniciar no meio da aula, o professor reimporta o último JSON e ninguém perde nada |
| Tempo real no painel | *Polling* a cada 5 s (TanStack Query) | Simples e robusto; WebSocket não compensa para 30 alunos |
| Identificação do aluno | **Login com usuário e senha** básicos: o aluno se cadastra na hora (usuário + senha + nome/apelido), a senha é guardada com hash (bcrypt) e o login devolve um token JWT | Funciona em qualquer máquina e treina o fluxo de cadastro/login que eles viram na API da aula 02. Senha mínima de 4 caracteres, sem e-mail e sem recuperação de senha |
| Acesso do professor | **Painel aberto, sem login**: `/professor` e as rotas `/api/professor/*` não pedem token | O app vive só durante a aula e não guarda nada sensível; não ter senha do professor simplifica o deploy (sem segredo no Fly) |

---

## 2. Dependências

As versões abaixo são as faixas principais. As versões exatas ficam travadas no `package-lock.json` no primeiro `npm install`. O Node é o **22** (o mesmo da aula 02 e do Dockerfile).

### 2.1 Produção (`dependencies`)

**Servidor**

| Pacote | Versão | Para quê |
|---|---|---|
| `fastify` | ^5 | Servidor HTTP da API |
| `@fastify/static` | ^10 | Servir o front compilado (`dist/web`) e cair no `index.html` nas rotas do React |
| `@fastify/rate-limit` | ^11 | Evitar que um aluno (ou um script) inunde a API. Conta **por aluno logado** (na escola, todos saem pelo mesmo IP) |
| `fastify-plugin` | ^6 | Organizar os plugins (igual à aula 02) |
| `fastify-type-provider-zod` | ^7 | Validar entrada e saída das rotas com Zod |
| `zod` | ^4 | Esquemas compartilhados entre front e back (respostas, questões) |
| `@prisma/client` | ^7 | Acesso ao banco |
| `@prisma/adapter-better-sqlite3` | ^7 | Driver SQLite do Prisma 7 (igual à aula 02) |
| `prisma` | ^7 | `prisma migrate deploy` ao subir o app no Fly |
| `jsonwebtoken` | ^9 | Token de login dos alunos, igual à aula 02 |
| `bcryptjs` | ^3 | Hash das senhas (JS puro, sem compilar nada no Docker), igual à aula 02 |
| `dotenv` | ^18 | Ler o `.env` em desenvolvimento |
| `pino-pretty` | ^13 | Logs legíveis no `fly logs` (bom para projetar) |

**Front** (entra no bundle do Vite)

| Pacote | Versão | Para quê |
|---|---|---|
| `react`, `react-dom` | ^19 | Interface |
| `react-router` | ^7 | Rotas: `/`, `/atividade`, `/professor`, `/professor/q/:id`, `/professor/dados` |
| `@tanstack/react-query` | ^5 | Salvar respostas, *retry* se a rede cair e *polling* do painel |
| `@material/material-color-utilities` | ^0.4 | Gerar a paleta Material 3 (claro/escuro) a partir da cor-semente |
| `@fontsource-variable/roboto-flex` | ^5 | Fonte do Material 3 sem depender do Google Fonts na rede da escola |
| `qrcode` | ^1.5 | QR code do endereço no painel (gerado no navegador, sem serviço externo) |
| `clsx` | ^2 | Juntar classes do Tailwind condicionalmente |

### 2.2 Desenvolvimento (`devDependencies`)

| Pacote | Versão | Para quê |
|---|---|---|
| `typescript` | ^5.9 | Tipagem |
| `vite` | ^8 | Dev server e build do front |
| `@vitejs/plugin-react` | ^6 | React no Vite |
| `tailwindcss` | ^4 | CSS utilitário |
| `@tailwindcss/vite` | ^4 | Integração do Tailwind 4 com o Vite (sem PostCSS separado) |
| `tsx` | ^4 | Rodar o servidor em TS no dev (`tsx watch`) |
| `concurrently` | ^10 | Subir Vite + Fastify juntos com um `npm run dev` |
| `vitest` | ^5 | Testes (mesma configuração do Vite) |
| `supertest` + `@types/supertest` | ^7 | Testar as rotas da API |
| `@testing-library/react` + `jsdom` | ^16 / ^29 | Testar os componentes de questão |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/jsonwebtoken`, `@types/qrcode` | — | Tipos |
| `eslint` + `typescript-eslint` + `eslint-plugin-react-hooks` | ^10 / ^8 / ^7 | Lint |
| `prettier` + `prettier-plugin-tailwindcss` | ^3 / ^0.8 | Formatação e ordem das classes do Tailwind |

### 2.3 Fora do npm

- **Docker** (o build roda no Fly, local é opcional) e a imagem `node:22-slim`, igual à aula 02.
- **flyctl**, já instalado (`~/.fly/bin`).
- **Nenhum serviço externo**: sem CDN, sem Google Fonts, sem banco gerenciado.

**Coisas que ficam de fora de propósito:** MUI, Redux, Socket.IO, ORM extra e biblioteca de CSV. O CSV é gerado à mão, umas 20 linhas, e o RFC 4180 é simples.

**Ícones sem `material-symbols`:** a fonte de ícones pesa 4 MB, e 30 alunos baixando isso no Wi-Fi da escola não compensa. Os ~15 ícones usados são SVG do Material Design embutidos em `web/componentes/Icone.tsx`.

**Prisma e react-router:** ficaram no 7 (o Prisma 8 ainda é RC, e o 7 é o mesmo da aula 02).

---

## 3. Estrutura de pastas

```
aula_03/atividade_online/
├─ shared/
│  ├─ questoes.ts        ← as 27 questões de atividade_aluno.md + 5 do ticket (texto, tipo, itens) — vai para o front
│  ├─ gabarito.ts        ← respostas das questões fechadas — SÓ o servidor importa
│  └─ esquemas.ts        ← Zod: formato de cada tipo de resposta
├─ server/
│  ├─ app.ts / server.ts
│  ├─ plugins/           ← estáticos, auth do aluno, erros, rate-limit
│  ├─ routes/            ← aluno.ts, respostas.ts, professor.ts, exportar.ts
│  └─ lib/               ← prisma.ts, correcao.ts (corrige as fechadas), csv.ts
├─ web/
│  ├─ index.html, main.tsx, tema.ts (Material 3 → variáveis CSS), index.css (Tailwind)
│  ├─ paginas/           ← Entrar, Atividade, Professor, ProfessorQuestao, ProfessorDados
│  └─ componentes/questoes/ ← um componente por tipo de questão
├─ prisma/schema.prisma + migrations/
├─ scripts/subir-aula.ps1, derrubar-aula.ps1   ← copiados da aula 02 e adaptados
├─ Dockerfile, fly.toml, vite.config.ts, tsconfig*.json, package.json
└─ README.md
```

---

## 4. Banco de dados (Prisma + SQLite)

```prisma
model Usuario {
  id        Int        @id @default(autoincrement())
  usuario   String     @unique      // login, minúsculo, sem espaços (3–20 caracteres)
  senhaHash String                  // bcrypt; a senha em texto nunca é gravada
  nome      String                  // nome ou apelido que aparece para o professor
  criadoEm  DateTime   @default(now())
  respostas Resposta[]
}

model Resposta {
  id          Int      @id @default(autoincrement())
  usuarioId   Int
  questaoId   String   // "A1", "B3", "T2" (ticket)...
  valor       String   // JSON da resposta (formato validado pelo Zod)
  marcacao    String?  // "S" | "C" | "P" | "?"
  correcao    String?  // o que o aluno escreveu na fase de correção
  motivoErro  String?  // por que o aluno acha que errou
  conferiu    Boolean? // o aluno marcou ✔ na correção
  atualizadoEm DateTime @updatedAt
  usuario     Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  @@unique([usuarioId, questaoId])
}

model Estado {             // uma linha só: a fase atual da aula e a hora do último export
  id           Int       @id @default(1)
  fase         String    @default("atividade") // atividade | correcao | ticket | encerrada
  ultimoExport DateTime? // para o lembrete "último export há X min"
}
```

**Avaliação das abertas** (modelo `Avaliacao`, uma por aluno × questão): `avaliacao` (certa / parcial / errada), `comentario` e uma cópia da resposta avaliada (`valorAvaliado`). Fica fora da `Resposta` para não mexer no "último salvamento" do aluno, e só vale enquanto a resposta for a mesma: se o aluno mudar, volta a ficar pendente. Quem avalia é o Claude Code no intervalo (`atividade_online/corrigir-aula03.md`) ou o professor, pelos botões em `/professor/q/:id`.

O acerto das questões fechadas **não é gravado**: ele é calculado na hora (e no export) a partir do `gabarito.ts`. Assim, se você ajustar o gabarito, tudo se recalcula sozinho.

---

## 5. As questões no site

Cada questão de `atividade_aluno.md` vira um item de `shared/questoes.ts`, com um **tipo**. Cada tipo tem um componente, pensado primeiro para o celular:

| Tipo | Questões | No celular | No computador |
|---|---|---|---|
| Texto livre | A1, A3, A6, A8, A10, B5, C1, C2, C3, E1, E2, T2 | Caixa de texto que cresce | Igual |
| Vários campos de texto | A11, C7, D2, T5 | Um campo por item, empilhados | Igual |
| Classificar itens (escolha) | A2, A4, A5, C4, C6 | Um cartão por item, com botões ("chips") das opções | Tabela com as opções em cada linha |
| Ordenar 1–7 | A7 | Lista com setas ↑ ↓ (sem arrastar, que é ruim no celular) | Igual (o arrastar ficou de fora) |
| Completar lacunas | A9, C5, D1, T1, T4 | Campos curtos empilhados | Em duas colunas |
| Tabela | B1 | Cartão por linha: chips Sim/Não para UDP e para TCP; o exemplo é texto | Tabela |
| Escolha com justificativa | B2, B3, T3 | Chips (UDP/TCP ou SYN/SYN-ACK/ACK) + campo "por quê" / "significa" | Tabela |
| V ou F com correção | B4 | Chips V/F + campo "corrija" que aparece só no F | Igual |

Em todas: as quatro marcações **S C P ?** como botões segmentados (padrão do Material 3), a ★ nas prioritárias e uma barra de progresso por parte.

---

## 6. Páginas e fluxo da aula

### Aluno (`/` e `/atividade`)
1. **Entrar:** tela com duas abas, **Entrar** (usuário + senha) e **Criar conta** (usuário + senha + nome/apelido). Erros claros: "usuário já existe" (409), "usuário ou senha incorretos" (401). O token fica no `localStorage`, então recarregar a página não desloga.
2. **Atividade:** abas por parte (A–E). Salvamento **automático** ao sair do campo, com indicador "salvo ✓ / salvando… / sem conexão" e rascunho no `localStorage`. Se a rede cair, nada se perde, e o envio é refeito quando ela voltar.
3. **Fase "correção"** (o professor libera): as respostas originais ficam **travadas**, e cada questão mostra o resultado, a resposta certa e a justificativa da IA (se houver). O aluno corrige só o que errou e pode comentar por que errou.
4. **Fase "ticket"**: as 5 perguntas do ticket de saída (bloco 8 da `aula_03.md`), sem consulta.

### Professor (`/professor`, aberto, sem login)
- **Controle da aula:** botões de fase (atividade → correção → ticket → encerrada) e a URL/QR code para projetar.
- **Termômetro automático** (substitui o bloco 3): por questão, as barras S/C/P/? e a % de acerto nas fechadas, ordenado da questão "mais difícil" para a mais fácil.
- **Questão em detalhe** (`/professor/q/A10`): distribuição das respostas fechadas e as respostas abertas **sem nome**, para projetar na revisão. Botão "mostrar nomes", desligado por padrão, para não projetar nomes sem querer.
- **Alunos:** quem entrou, progresso e último salvamento.
- **Lembrete:** um aviso fixo "último export há X min" que fica amarelo depois de 20 min; clicar nele leva para a página de dados.

### Dados (`/professor/dados`, meio escondida)
Os botões de exportar e importar ficam numa página à parte, sem destaque no painel: só um link discreto no rodapé (e o lembrete). Quem souber o endereço entra direto.

- **Exportar JSON**: tudo (usuários com o hash da senha, respostas, fase), para guardar e **reimportar** depois.
- **Exportar CSV**: uma linha por aluno × questão: `usuário, nome, questão, resposta, marcação, acertou, correção, conferiu, atualizado_em`. Abre direto no Excel (UTF-8 com BOM e `;` como separador).
- **Importar JSON**: restaura o banco (pede confirmação). O arquivo é validado com Zod no mesmo formato do export: se não bater, volta **400** e o banco não é tocado.

---

## 7. API

| Método e rota | Quem | O que faz |
|---|---|---|
| `POST /api/auth/cadastro` | aluno | Cria a conta (201) e já devolve o token; 409 se o usuário existe |
| `POST /api/auth/login` | aluno | Usuário + senha → token (401 se errar; 429 depois de 5 tentativas por minuto do mesmo usuário) |
| `GET /api/eu` | logado | Quem sou eu + minhas respostas (para retomar a atividade) |
| `GET /api/questoes` | todos | Questões, **sem** gabarito |
| `GET /api/estado` | todos | Fase atual e hora do último export |
| `GET /api/status` | todos | "Está no ar?" (health check do Fly) |
| `PUT /api/eu/respostas/:questaoId` | aluno | Salva uma resposta (idempotente, por isso PUT) |
| `PATCH /api/eu/respostas/:questaoId` | aluno | Salva a correção (fase "correção") |
| `PUT /api/professor/estado` | aberto | Muda a fase |
| `GET /api/professor/resumo` | aberto | Termômetro (por questão) |
| `GET /api/professor/questoes/:id` | aberto | Respostas de uma questão |
| `GET /api/professor/alunos` | aberto | Lista de alunos com progresso |
| `GET /api/professor/exportar?formato=json\|csv` | aberto | Download (`Content-Disposition: attachment`) |
| `POST /api/professor/importar` | aberto | Restaura a partir do JSON (400 se o formato não for o do export) |
| `GET /api/professor/avaliacoes` | aberto | Partes abertas para avaliar (pendentes, ou `todas=true`), com a referência do gabarito comentado e sem nomes |
| `PUT /api/professor/avaliacoes` | aberto | Grava as avaliações (certa / parcial / errada + comentário) em lote; ignora as de respostas que mudaram depois da leitura |

As rotas `/api/professor/*` são **abertas**: não pedem token.

Bônus didático: as rotas usam os métodos e os códigos que a turma acabou de revisar (PUT × PATCH, 201, 204, 400, 401, 404, 409, 429). Abrir `/api/eu` sem token devolve **401**. Dá para abrir o DevTools na aula e mostrar o próprio site conversando com a API.

---

## 8. Etapas

| # | Etapa | Entrega |
|---|---|---|
| 1 | Esqueleto | `package.json`, Vite + Tailwind 4 + React, Fastify servindo o build, `npm run dev` com proxy `/api` |
| 2 | Tema Material 3 | `tema.ts` gera os tokens (claro/escuro), componentes base: botão, chip, botão segmentado, cartão, campo de texto, abas |
| 3 | Questões | `shared/questoes.ts` + `gabarito.ts` transcritos de `atividade_aluno.md` e do gabarito da `aula_03.md` |
| 4 | Banco, login e API do aluno | Prisma schema, migrations, cadastro/login (bcrypt + JWT), rotas de respostas, testes com Vitest + supertest |
| 5 | Telas do aluno | Entrar / criar conta, atividade com os 7 tipos de questão, salvamento automático, fases de correção e ticket |
| 6 | Painel do professor | Fases, termômetro, detalhe da questão, lista de alunos |
| 7 | Exportar / importar | Página `/professor/dados`, JSON, CSV, importação validada com Zod, lembrete de export, testes de "exporta → apaga → importa → igual" |
| 8 | Celular | Conferir em 360 px (Android pequeno) e em 1366 px (PC do laboratório); alvos de toque ≥ 48 px |
| 9 | Deploy | Dockerfile multi-stage, `fly.toml` (sem volume, `auto_stop_machines = "off"`, 1 máquina em `gru`), `subir-aula.ps1` e `derrubar-aula.ps1`; o derrubar **pergunta se você exportou** antes de destruir |
| 10 | Ensaio | (Local já feito: fluxo completo no Edge em 360 px e 1366 px, claro e escuro.) Subir no Fly, abrir com 3–4 abas/celulares, simular a aula inteira, derrubar a máquina no meio e restaurar pelo JSON |
| 11 | Docs | `README.md` (como rodar, subir, exportar) e ajuste da `aula_03.md` (bloco 3 vira o termômetro automático) |

---

## 9. Riscos e respostas

| Risco | Resposta |
|---|---|
| A máquina do Fly reinicia e o banco some | Importar o último JSON. O lembrete do painel força exports frequentes |
| A rede da escola cai | Salvamento automático com reenvio e rascunho local. Se cair de vez: folha impressa |
| Aluno fecha a aba ou troca de PC | Faz login de novo e as respostas estão lá |
| Aluno esquece a senha | Não há recuperação nem redefinição: ele cria uma conta nova e recomeça. A conta antiga continua no banco e no export |
| Senhas fracas | Aceitável: o app vive 4 horas e não guarda nada sensível. As senhas ficam com hash, e o login tem rate-limit (5 tentativas por minuto **por usuário**: limitar por IP travaria a turma toda, que sai pela mesma internet) |
| Alguém acessa o painel ou a página de dados | Aceitável, por decisão do professor: fica tudo aberto. Exportar e importar ficam numa página meio escondida, o importar só aceita um JSON no formato do export e pede confirmação, e o export frequente permite desfazer qualquer estrago |
| Aluno digita algo enorme ou malicioso | Zod limita o tamanho. O React escapa o HTML (nada de `dangerouslySetInnerHTML`) |

---

## 10. Próxima versão

Pedidos do professor depois de usar o site ao vivo na aula 03 (04/11/2026).

| # | Pedido | Como está hoje | O que falta |
|---|---|---|---|
| 1 | Ver como cada aluno preencheu, de certo ou errado | `/professor` só mostra o progresso, e `/professor/q/:id` mostra uma questão por vez | Uma tela por aluno (algo como `/professor/aluno/:id`) com cada questão, a resposta, o certo e o errado, a nota e o comentário |
| 2 | Corrigir a correção | `correcao` e `motivoErro` são guardados e aparecem em `/professor/q/:id`, mas ninguém os avalia, a nota não muda e `/api/professor/avaliacoes` não os devolve | Uma forma de avaliar a correção do aluno, separada da avaliação da resposta original |
| 3 | Deixar as perguntas de feedback para o professor (Parte E: E1 e E2) abertas a qualquer momento | Elas travam junto com a atividade quando a fase muda: em `PUT /eu/respostas/:questaoId`, tudo o que não é ticket só salva na fase `atividade`. Ao liberar a correção na aula 03, só 12 dos 21 alunos tinham respondido a E1, e 11 a E2 | Liberar a Parte E em todas as fases, inclusive na correção e no ticket, e mostrar essas perguntas ao aluno mesmo com a atividade travada |

Sugestão que surgiu na mesma aula (não foi pedido do professor):

- **Parte fechada da A9:** o gabarito só aceita o número puro, então "porta 80" e "HTTP=80" contam como erro. Foram 6 alunos: o painel mostrou 39% de acerto, e o real era 72%. Vale aceitar essas formas em `shared/gabarito.ts` e deixar claro no rótulo que o campo pede o número da porta (5 alunos escreveram definições, como "Comunicação entre navegador e site").

**Quando fazer:** antes da próxima aula, nunca durante. O banco não tem volume, então um deploy apaga os dados.
