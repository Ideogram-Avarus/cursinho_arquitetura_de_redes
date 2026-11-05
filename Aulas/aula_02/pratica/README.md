# 🥔 Bolsa de Batatas — API REST para a prática de HTTP

API de treino da Aula 02: um mercado de ações onde as empresas são batatas. Cada grupo de rotas ensina um conceito de HTTP (métodos, parâmetros, status, cabeçalhos, autenticação, cache, upload...). Todas as respostas e mensagens de erro estão em português.

**Stack:** TypeScript (apelido `@/` → `src/`, resolvido no build pelo `tsc-alias`) · Fastify 5 (`@fastify/autoload`, `cors`, `static`, `multipart`, `swagger`, `swagger-ui`) · Zod 4 + `fastify-type-provider-zod` · Prisma 7 + SQLite (`@prisma/adapter-better-sqlite3`) · JWT (`jsonwebtoken`) + `bcryptjs` · Pino + `pino-pretty` · Jest + Supertest · Fly.io.

---

## Rodando no computador

```bash
npm install            # também gera o Prisma Client (postinstall)
cp .env.example .env   # no Windows: copy .env.example .env
npx prisma migrate deploy
npm run dev            # http://localhost:3000/docs
```

Na primeira subida, se o banco estiver vazio, os dados de demonstração são criados sozinhos.

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor com recarga automática (tsx) e logs coloridos |
| `npm test` | Todos os testes (Jest + Supertest, banco `prisma/test.db` separado) |
| `npm run typecheck` | Checagem de tipos |
| `npm run build` / `npm start` | Compila para `dist/` (o `tsc-alias` troca o apelido `@/` por caminhos relativos) e roda o JS compilado |
| `npm run db:migrate` | Cria uma migration depois de mudar `prisma/schema.prisma` |
| `npm run db:seed` | Apaga tudo e recria os dados de demonstração |
| `npm run db:studio` | Abre o Prisma Studio para ver o banco |

### Variáveis de ambiente (`.env`)

| Variável | Padrão | Para quê |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | Arquivo do SQLite |
| `PORT` / `HOST` | `3000` / `0.0.0.0` | Onde o servidor escuta |
| `JWT_SECRET` | (troque!) | Segredo que assina os tokens |
| `JWT_EXPIRES_IN_SECONDS` | `900` | Validade do token |
| `ADMIN_PASSWORD` | `professor-demo` | Senha do usuário `professor` (ADMIN) |
| `LOG_LEVEL` | `info` | Nível do log |
| `LOG_PRETTY` | `true` | Log em uma linha legível (pino-pretty) |
| `HTTPS_PORT` | (vazio) | Se definido, também atende HTTPS nesta porta (só local) |
| `HTTPS_CERT` / `HTTPS_KEY` | `certs/cert.pem` / `certs/key.pem` | Certificado e chave do HTTPS local |

### HTTP e HTTPS ao mesmo tempo (local)

Para mostrar os dois lado a lado na aula:

```bash
npm run certs:gerar     # cria certs/cert.pem e certs/key.pem (autoassinado, 1 ano; precisa do openssl, que vem com o Git for Windows)
# no .env: HTTPS_PORT=3443
npm run dev
```

- `http://localhost:3000/docs` → sem criptografia; o `/api/seguranca` mostra `"conexaoSegura": false`.
- `https://localhost:3443/docs` → com TLS; o `/api/seguranca` mostra `"conexaoSegura": true`.

As duas portas atendem o mesmo app (mesmas rotas, mesmo banco, mesmos logs). Como o certificado é **autoassinado**, o navegador mostra o aviso "Sua conexão não é particular" e o `curl` recusa sem o `-k`. Isso é esperado e rende uma boa conversa: o tráfego **está** criptografado, mas o navegador não tem como saber **quem** está do outro lado, porque nenhuma autoridade certificadora confiável assinou o certificado. No Fly.io isso não acontece: o certificado de `*.fly.dev` é válido, e o `HTTPS_PORT` nem é usado (lá o HTTPS é feito pelo proxy da plataforma).

---

## Contas de demonstração

| Usuário | Senha | Papel |
|---|---|---|
| `aluno` | `senha-demo` | INVESTIDOR (R$ 10.000) |
| `professor` | valor de `ADMIN_PASSWORD` | ADMIN |

Os alunos também podem criar a própria conta em `POST /api/auth/registro` (com apelido, nunca o nome completo).

---

## Rotas

A documentação interativa fica em **`/docs`** (Swagger UI). A raiz `/` responde **302** para `/docs`.

| Grupo | Método e caminho | O que ensina |
|---|---|---|
| 1. Primeiros passos | `GET /api/ola` | GET simples, JSON, 200 |
| | `GET /api/requisicao` | Cabeçalhos recebidos (User-Agent, Accept...), protocolo |
| | `GET /api/status` | Monitoramento (200 ou 503) |
| 2. Parâmetros de URL | `GET /api/batatas?setor=&precoMin=&precoMax=&busca=&ordenarPor=&ordem=&pagina=&limite=` | Query string, filtros, paginação |
| | `GET /api/batatas/{id}` | Parâmetro de caminho, 404, 400 |
| | `GET /api/busca?q=` | Codificação de URL (`%20`) |
| 3. Respostas e erros | `GET /api/codigos/{codigo}` | Simula 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 405, 409, 418, 429, 500, 502, 503, 504 |
| | `GET /api/demora?ms=` | Latência e timeout do cliente |
| | `GET /api/nao-encontrado` · `GET /api/bule` | 404 e 418 de propósito |
| 4. Enviando dados | `POST /api/batatas` | Corpo JSON, 201 + `Location`, 409, 400 |
| | `POST /api/eco` | Devolve o JSON; erros 400 (JSON quebrado/vazio), 413, 415 |
| | `POST /api/avaliacoes` · `GET /api/avaliacoes` | Validação de formulário |
| 5. Alterar e apagar | `PUT /api/batatas/{id}` | Substituição completa |
| | `PATCH /api/batatas/{id}` | Alteração parcial |
| | `DELETE /api/batatas/{id}` | 204 No Content; batatas oficiais → 403 |
| 6. Autenticação | `POST /api/auth/registro` | Cria conta (201, 409) |
| | `POST /api/auth/login` | Token JWT Bearer (401 se errar a senha) |
| | `POST /api/auth/renovar` | Novo token |
| | `GET /api/perfil` | Sem token → 401 |
| | `GET /api/admin` | Token de aluno → 403 |
| 7. Mercado | `GET /api/carteira` · `POST /api/ordens` · `GET /api/ordens` | Compra/venda com token; saldo insuficiente → 409 |
| | `GET /api/ranking` | Ranking dos investidores (bom para projetar) |
| 8. Imagens e arquivos | `GET /api/imagens/metadados` | Lista de imagens |
| | `GET /api/imagens/{batata.png\|batata.jpg}?download=true` | Content-Type binário e Content-Disposition |
| | `POST /api/arquivos` | Upload `multipart/form-data` (1 MB, nada é guardado) |
| 9. Cache | `GET /api/cache/publico` · `GET /api/cache/sem-cache` | Cache-Control |
| | `GET /api/etag` | ETag + If-None-Match → 304 |
| 10. Segurança | `GET /api/seguranca` | HTTPS, proxy, X-Forwarded-* |
| 11. Limites | `GET /api/limite` | 429 + Retry-After (5 req / 30 s por token, `X-Aluno` ou IP) |
| | `GET /api/historico?ticker=&pagina=&limite=` | Paginação de 365 dias de pregões |
| Professor | `POST /api/admin/reset` | Recria os dados (rodar antes de cada turma) |

Também funcionam em qualquer rota:
- **405** com cabeçalho `Allow` quando o caminho existe mas o método não (ex.: `DELETE /api/ola`);
- **`OPTIONS`** responde 204 com `Allow` listando os métodos aceitos;
- **`HEAD`** em toda rota GET;
- **CORS** liberado (Hoppscotch e `fetch` de outros sites funcionam);
- cabeçalho **`X-Request-Id`** em toda resposta.

### Regras do mercado
- Cada conta começa com **R$ 10.000**.
- Cada ação comprada sobe o preço **0,1%** e cada ação vendida desce **0,1%** (máx. 20% por ordem).
- As 14 batatas oficiais não podem ser alteradas nem apagadas; os alunos criam as suas com `POST /api/batatas`.

---

## Logs

Cada requisição vira uma linha, fácil de ler no projetor:

```
[11:00:34] INFO: ✅ POST /api/ordens → 201 (12 ms) — curl 👤 aluno
[11:00:35] WARN: ⚠️  GET /api/perfil → 401 (1 ms) — navegador (Chrome)
```

Tokens, cookies e senhas nunca vão para o log.

---

## Deploy no Fly.io (só durante a aula)

O app existe no Fly.io apenas enquanto a aula acontece: sobe antes, é apagado depois. Não há volume nem persistência: o banco nasce do zero, com os dados de demonstração, a cada subida.

```powershell
.\scripts\subir-aula.ps1      # cria o app, define os segredos, faz o deploy e espera a API responder
fly logs              # projete durante a aula
.\scripts\derrubar-aula.ps1   # depois da aula: apaga o app inteiro (máquina e dados)
```

- **`scripts/subir-aula.ps1`**: faz login se precisar, cria o app (nome do `fly.toml`, ou `-App outro-nome`), gera um `JWT_SECRET` aleatório, define a senha do `professor` (`-SenhaProfessor`, padrão `professor-demo`) e faz o deploy com **uma máquina só** (`--ha=false`). No fim, mostra as URLs. Se o app já existir, só atualiza.
- **`scripts/derrubar-aula.ps1`**: pede confirmação (`-Forcar` pula) e roda `fly apps destroy`. Depois disso não há nada rodando nem cobrando.
- Enquanto o app existe, a máquina fica **sempre ligada** de propósito: sem volume, uma máquina que desliga por inatividade volta com o banco zerado, e as contas e batatas dos alunos sumiriam no meio da aula.
- Se o PowerShell bloquear o script: `powershell -ExecutionPolicy Bypass -File .\scripts\subir-aula.ps1`.

---

## Estrutura

```
prisma/schema.prisma      modelos: Batata, Usuario, Posicao, Ordem, Avaliacao
src/app.ts                monta o Fastify (autoload de plugins/ e routes/)
src/server.ts             sobe o servidor
src/plugins/              cors, swagger, erros (em português), logs, rotas (405/OPTIONS), autenticação, multipart, estáticos
src/routes/               um arquivo por grupo de rotas (todas em /api)
src/lib/                  auth (JWT/bcrypt), seed, regras do mercado, histórico, limitador
src/schemas/comum.ts      schemas Zod compartilhados
public/imagens/           batata.png e batata.jpg
tests/                    um arquivo de teste por grupo de rotas
```
