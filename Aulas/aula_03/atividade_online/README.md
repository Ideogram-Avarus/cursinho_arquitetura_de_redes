# Atividade online — Aula 03

Versão online de `../atividade_aluno.md`. Os alunos respondem no celular ou no computador, e o professor acompanha tudo ao vivo no painel. O plano completo está em `../plano_site_atividade.md`.

| Endereço             | Quem usa                            | O que tem                                                             |
| -------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `/`                  | aluno                               | Criar conta / entrar                                                  |
| `/atividade`         | aluno                               | A folha (Partes A–E), a correção e o ticket de saída, conforme a fase |
| `/professor`         | professor (**aberto, sem login**)   | Fases da aula, QR code, termômetro, lista de alunos                   |
| `/professor/grafico` | professor                           | Gráfico de acertos e erros ao vivo, para o datashow (sem nomes)       |
| `/professor/q/A10`   | professor                           | Uma questão em detalhe, para projetar (sem nomes)                     |
| `/professor/dados`   | professor (link discreto no rodapé) | Exportar JSON/CSV e importar JSON                                     |

## Rodar no computador

```powershell
npm install
copy .env.example .env      # só na primeira vez
npm run db:migrate          # cria prisma/dev.db
npm run dev                 # API em :3000 + site em http://localhost:5173
```

O `npm run dev` aceita conexões da rede: dá para abrir no celular com `http://<IP do PC>:5173`.

Outros comandos:

| Comando                           | Para quê                                                    |
| --------------------------------- | ----------------------------------------------------------- |
| `npm test`                        | Testes (API com supertest, componentes com Testing Library) |
| `npm run typecheck`               | Confere os tipos do servidor e do front                     |
| `npm run lint` / `npm run format` | ESLint / Prettier                                           |
| `npm run build` + `npm start`     | Roda a versão de produção em http://localhost:3000          |

## Dia da aula

1. **Subir:** `.\scripts\subir-aula.ps1` (cria o app no Fly.io, se precisar, e faz o deploy). No fim ele mostra os endereços.
2. **Projetar o QR code:** em `/professor`, botão **Projetar**.
3. **Deixar o gráfico no datashow:** em `/professor`, botão **Gráfico ao vivo** e depois **Tela cheia**. Ele atualiza a cada 3 s, troca sozinho para o ticket na fase do ticket e avisa se perder a conexão. Clicar numa barra abre a questão em detalhe.
4. **Conduzir as fases** pelo painel: **Atividade** → **Correção** (as respostas travam, o aluno vê a resposta certa e a justificativa da IA, e corrige só o que errou) → **Ticket de saída** (sem consulta) → **Encerrada**. Dá para voltar a qualquer fase.
5. **Exportar o JSON de tempos em tempos** em `/professor/dados`. O aviso no topo do painel fica amarelo depois de 20 min sem export.
6. **Depois da aula:** exporte o JSON **e** o CSV e rode `.\scripts\derrubar-aula.ps1`. Antes de apagar, ele pergunta se você exportou.

### Correção das abertas com o Claude (no intervalo)

As partes fechadas (escolhas, ordem, portas...) são corrigidas sozinhas pelo `shared/gabarito.ts`. As partes de **texto livre** podem ser avaliadas pelo Claude Code em poucos minutos, como **certa / parcial / errada** com um comentário curto. As instruções estão em `corrigir-aula03.md`, nesta pasta.

**Uma vez só:** copie `corrigir-aula03.md` para `.claude/commands/corrigir-aula03.md` na raiz do repositório (`cursinho_arquitetura_de_redes`). Assim ele vira um comando do Claude Code:

```powershell
New-Item -ItemType Directory -Force ..\..\..\.claude\commands
Copy-Item corrigir-aula03.md ..\..\..\.claude\commands\
```

**No intervalo:** abra o Claude Code na raiz do repositório e rode:

```
/corrigir-aula03 https://atividade-redes-aula03.fly.dev
/corrigir-aula03 https://atividade-redes-aula03.fly.dev A10,C7,B2
/corrigir-aula03 https://atividade-redes-aula03.fly.dev --revisar
```

O primeiro avalia tudo o que está pendente. O segundo, só essas questões (comece pelas ⭐ se o tempo for curto). O terceiro refaz também as já avaliadas.

Ele lê as respostas pendentes (sem nomes, só um número por aluno), avalia, grava em lote e termina com um resumo dos erros mais comuns, para guiar a revisão. Sem copiar o arquivo, também dá para pedir: _"siga Aulas/aula_03/atividade_online/corrigir-aula03.md com a URL https://..."_.

- **No painel**, o termômetro passa a usar as abertas no acerto (quando a questão tem parte fechada e aberta, cada uma vale metade) e mostra quantas faltam avaliar. Em `/professor/q/A10`, cada resposta tem os botões **Certa / Parcial / Errada**: dá para conferir e trocar o que o Claude decidiu.
- **Se o aluno mudar a resposta** depois de avaliada, a avaliação deixa de valer e a resposta volta para "para avaliar". Uma gravação feita a partir de uma leitura antiga é ignorada.
- As avaliações vão no **export JSON** (e voltam no import) e no **CSV** (colunas "avaliação" e "comentário da avaliação").
- **O aluno lê o comentário** na fase de correção, como "Justificativa da IA". Por isso ele é escrito para o aluno, e não para o professor. Avalie antes de liberar a correção, ou durante: a tela do aluno atualiza sozinha.
- As respostas esperadas que o Claude usa estão em `REFERENCIAS`, em `shared/gabarito.ts` (tiradas do gabarito comentado da `aula_03.md`). Se quiser outro critério, mude ali.

### Se a máquina do Fly reiniciar

O banco não tem volume: ele some se a máquina reiniciar, e também se você rodar o `subir-aula.ps1` de novo. Para recuperar, importe o último JSON em `/professor/dados`. Os alunos continuam logados, porque os ids e o `JWT_SECRET` continuam os mesmos (o script só cria o segredo na primeira vez).

### Se a rede da escola cair

Cada resposta fica numa fila no navegador e é reenviada sozinha quando a rede volta (o topo da página mostra "sem conexão"). Se a rede cair de vez, use a folha impressa (`../atividade_aluno.pdf`).

## Como funciona

```
shared/questoes.ts   as 27 questões + 5 do ticket (vai para o navegador, SEM respostas)
shared/gabarito.ts   respostas das fechadas + referências das abertas: SÓ o servidor importa
shared/esquemas.ts   formatos (Zod) da API e do JSON de export
server/              Fastify + Prisma (SQLite). Serve a API em /api e o front em dist/web
web/                 React + Tailwind, tema Material 3 gerado em web/tema.ts
corrigir-aula03.md   instruções para o Claude Code avaliar as abertas no intervalo
```

- **Toda resposta é um objeto `{ chave: texto }`.** As chaves de cada questão saem de `chavesDaQuestao()` (`shared/questoes.ts`), e o servidor recusa qualquer outra (400).
- **O acerto não é gravado.** Ele é recalculado a partir do `gabarito.ts` sempre que o painel ou o export pedem. Se você ajustar o gabarito, tudo se recalcula sozinho (basta fazer o deploy de novo).
- **Termômetro:** a dificuldade de cada questão mistura a parte "insegura" das marcações (P + ?) com o erro nas partes fechadas. As questões abertas usam só as marcações.
- **Limite de requisições:** na escola, a turma inteira sai pelo mesmo IP. Por isso o limite conta **por aluno logado**, e o login tem 5 tentativas por minuto **por usuário**.
- **Ícones:** SVG embutido (`web/componentes/Icone.tsx`). A fonte `material-symbols` pesa 4 MB, e 30 alunos baixando isso no Wi-Fi da escola não compensa.

### API

A documentação interativa (Swagger) fica em **`/docs`** (ex.: http://localhost:3000/docs, ou http://localhost:5173/docs no `npm run dev`). O JSON do OpenAPI fica em `/docs/json`.

| Método e rota                                                        | Quem         | O que faz                                                                                                                      |
| -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/auth/cadastro`                                            | aluno        | Cria a conta (201) e devolve o token; 409 se o usuário existe                                                                  |
| `POST /api/auth/login`                                               | aluno        | Usuário + senha → token (401 se errar, 429 depois de 5 tentativas)                                                             |
| `GET /api/eu`                                                        | aluno logado | Quem sou eu + minhas respostas                                                                                                 |
| `PUT /api/eu/respostas/:questaoId`                                   | aluno logado | Salva uma resposta e/ou a marcação (409 fora da fase)                                                                          |
| `PATCH /api/eu/respostas/:questaoId`                                 | aluno logado | Salva só a correção (fase "correção")                                                                                          |
| `GET /api/questoes` • `GET /api/estado` • `GET /api/status`          | todos        | Questões sem gabarito • fase atual • "está no ar?"                                                                             |
| `PUT /api/professor/estado`                                          | aberto       | Muda a fase                                                                                                                    |
| `GET /api/professor/resumo` • `/alunos` • `/questoes/:id?nomes=true` | aberto       | Termômetro • alunos • detalhe                                                                                                  |
| `GET /api/professor/exportar?formato=json\|csv`                      | aberto       | Download (`Content-Disposition: attachment`)                                                                                   |
| `POST /api/professor/importar`                                       | aberto       | Restaura o JSON (400 se não estiver no formato do export)                                                                      |
| `GET /api/professor/avaliacoes?questoes=A10,C7&todas=true`           | aberto       | Partes abertas para avaliar: enunciado, referência e respostas (sem nomes). Padrão: só as pendentes                            |
| `PUT /api/professor/avaliacoes`                                      | aberto       | Grava avaliações em lote: `{ avaliacoes: [{ usuarioId, questaoId, versao, avaliacao, comentario }] }`. `avaliacao: null` apaga |

Para mostrar na aula: abra o DevTools (aba Rede) e veja o site usando os métodos e códigos da revisão: o `PUT` de cada resposta, o `PATCH` da correção, o `401` de `/api/eu` sem token e o `409` ao tentar responder fora da fase.
