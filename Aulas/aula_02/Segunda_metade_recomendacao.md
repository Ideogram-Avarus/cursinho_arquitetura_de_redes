# Aula 02 — Recomendação para a segunda metade (prática de HTTP)

**Horário:** 2h00–4h00 (depois do intervalo)
**Ideia central:** *a mesma requisição HTTP, feita com ferramentas diferentes, continua sendo a mesma requisição.* O aluno vai do mais visual (navegador) ao mais "cru" (`curl -v`) e percebe que o protocolo é o que importa; a ferramenta é só a interface.

**API da prática:** a "🥔 Bolsa de Batatas", em `pratica/` (TypeScript + Fastify, documentada no `pratica/README.md`). É um mercado de ações onde as empresas são batatas: os alunos listam, criam e alteram batatas, fazem login, compram e vendem ações e disputam um ranking.

**Formato:** quadros curtos (Quadros 6 a 8 do `Aula_02_v2.md`; métodos e erros já foram vistos no Quadro 5, antes do intervalo) intercalados com prática, sempre logo em seguida ao quadro que ela usa. Os alunos trabalham em **duplas**: um digita, o outro anota na ficha, e eles trocam a cada atividade.

---

## 1. Linha do tempo

| Tempo | Atividade | Ferramenta | Endpoints |
|---|---|---|---|
| 2h00–2h15 | **Quadro 6**: anatomia da URL e da mensagem + demonstração no projetor | DevTools | `/api/ola` |
| 2h15–2h35 | **Prática 1**: o navegador também é um cliente HTTP | navegador + DevTools | `ola`, `requisicao`, `batatas`, `batatas/{id}`, `busca`, `imagens/batata.png`, `codigos/{codigo}` |
| 2h35–2h50 | **Quadro 7**: API REST, CRUD e respostas de sucesso | — | — |
| 2h50–3h35 | **Prática 2**: missão CRUD + caça aos erros | Swagger UI → cliente gráfico → `curl` | `POST/GET/PATCH/DELETE /api/batatas`, `POST /api/eco` |
| 3h35–3h47 | **Quadro 8**: cabeçalhos, autenticação e HTTPS | — | — |
| 3h47–3h55 | **Prática 3**: token, 401 × 403 | Swagger (Authorize) | `auth/login`, `perfil`, `admin`, `ordens`, `ranking` |
| 3h55–4h00 | **Quadro 9**: resumo e entrega da ficha | — | — |

**Se atrasar:** corte nesta ordem: (1) a parte de criptografia do Quadro 8 vira só fala; (2) a Prática 3 vira abertura da aula 03; (3) o `curl` da Prática 2 vira demonstração do professor no projetor.
**Se sobrar tempo:** use os desafios bônus (seção 6).

---

## 2. Checklist antes da aula

### Na API (Fly.io)
- [ ] Antes da aula, dentro de `pratica/`: rodar `.\scripts\subir-aula.ps1`. Ele cria o app na região **`gru`** (São Paulo) com uma máquina só, faz o deploy e mostra as URLs. O banco nasce do zero com os dados de demonstração, então `/api/batatas/1` é sempre a Batata Inglesa.
- [ ] Depois da aula: rodar `.\scripts\derrubar-aula.ps1`, que apaga o app e os dados. Nada fica rodando nem cobrando.
- [ ] Se precisar zerar no meio da aula (ex.: duas turmas seguidas): `POST /api/admin/reset` com o token do `professor`.
- [ ] Deixar `fly logs` aberto num terminal do notebook do professor (ver seção 5).

### Na rede da escola (testar **dias antes**, de um PC do laboratório)
- [ ] O domínio `*.fly.dev` abre? Alguns firewalls/proxies escolares bloqueiam domínios desconhecidos ou fazem inspeção de TLS (o certificado aparece como "não confiável").
- [ ] `curl.exe` existe nos PCs? (vem no Windows 10/11; ver seção 4 sobre o PowerShell)
- [ ] O cliente gráfico escolhido está instalado? Postman e Insomnia pedem login/conta para boa parte das funções. **Bruno** (código aberto, sem conta) ou **Thunder Client** (extensão do VS Code) são alternativas sem cadastro. Se não der para instalar nada, use o Hoppscotch no navegador (`hoppscotch.io`); a API já tem CORS liberado.
- [ ] Ver se o laboratório sai para a internet por **um único IP público (NAT)**. Quase certamente sai, e isso afeta o rate limit (ver seção 7).

### Na sala
- [ ] Escrever no canto do quadro, e manter a aula toda, a URL da API e a do Swagger:
  `https://<app>.fly.dev` e `https://<app>.fly.dev/docs`
- [ ] Um QR code projetado da URL ajuda quem usa o celular.
- [ ] Imprimir a **ficha de requisições** (seção 8), uma por dupla, e o **roteiro do aluno** (seção 9), que pode virar a colinha da aula, como a `colinha_aula_01.pdf`.

### Plano B (sem internet)
- Rodar a API no notebook do professor (`npm run dev`) e os alunos acessam `http://<IP-do-notebook>:3000` pela rede local. Isso ainda serve de gancho para a aula: IP, porta e HTTP sem S. (Antes da aula, dentro de `pratica/`: copiar `.env.example` para `.env`, rodar `npm install`, `npx prisma migrate deploy` e `npm run dev`.)
- Se nem isso funcionar: o professor faz tudo no projetor e os alunos preenchem a ficha a partir do que veem.

---

## 3. Roteiro das práticas

### Prática 1 (2h15–2h35): o navegador também é um cliente HTTP

**Objetivo:** ver na prática as partes do Quadro 6 (método, URL, status, cabeçalhos, corpo).
**Ferramenta:** barra de endereço + **F12 → aba Rede (Network)**. Peça para marcar "Preservar log" e filtrar por "Fetch/XHR" ou "Tudo".

| # | Faça | Observe / responda na ficha |
|---|---|---|
| 1 | Abrir `/api/ola` | Método? Status? Qual o `Content-Type` da resposta? |
| 2 | Abrir `/api/requisicao` | Qual `User-Agent` o servidor recebeu? Guarde esse valor, porque vamos comparar com o curl depois. |
| 3 | `/api/batatas?setor=processada&precoMax=15` | Que partes da URL são a query string? Mude os valores e veja o resultado mudar. |
| 4 | `/api/batatas/1` e depois `/api/batatas/99999` | 200 × 404. O corpo do 404 explica o erro? |
| 5 | `/api/busca?q=batata doce` | O que o navegador fez com os espaços na URL? (`%20`) Compare `urlRecebida` e `termo` na resposta. |
| 6 | `/api/imagens/batata.png` | O `Content-Type` agora é `image/png`. O navegador decide **como mostrar** pela resposta, não pela extensão. |
| 7 | `/api/codigos/500` e `/api/bule` | Como o navegador mostra um 500? E o 418? |

**Pergunta para fechar (oral):** "Até agora só fizemos GET. Por que pela barra de endereço não dá para fazer um POST?" → o navegador só faz GET pela barra; para os outros métodos precisamos de formulário, JavaScript ou de **outras ferramentas**. Retome os métodos do Quadro 5: esse é o gancho para o Quadro 7.

---

### Prática 2 (2h50–3h35): missão CRUD + caça aos erros

**Objetivo:** usar os 4 tipos de operação (CRUD) e ver os códigos 201, 200, 204, 400 e 404 acontecendo.
**Progressão de ferramentas (cada etapa reforça que o protocolo é o mesmo):**

**Etapa A, no Swagger UI (`/docs`), ~12 min:** é a forma mais guiada, com botão **Try it out → Execute**.
1. `POST /api/batatas` com uma batata inventada pela dupla ("abrir o capital"). O exemplo já vem preenchido; peça para trocarem o `ticker` (4 letras + 1 ou 2 números, ex.: `ANLE3`) e colocarem o nome da dupla em `criadoPor`.
2. Anotar: status (**201**), cabeçalho **`Location`** e o `id` gerado.
3. `GET /api/batatas/{id}` com o id criado → 200.
4. `PATCH /api/batatas/{id}` com `{"preco": 99.90}` → só o preço mudou?
5. `DELETE /api/batatas/{id}` → **204** (sem corpo).
6. `GET /api/batatas/{id}` de novo → **404**.
7. Tentar `PATCH` ou `DELETE` na batata `1` (oficial da bolsa) → **403**. Um POST com um ticker que já existe (ex.: `FRIT3`) → **409**.

🗣️ Mostre que o Swagger exibe o **comando curl equivalente** a cada execução. Essa é a ponte para a Etapa C.

**Etapa B, no cliente gráfico (Bruno/Postman/Insomnia/Thunder Client), ~10 min:**
- Repetir o `POST` montando a requisição "na mão": método, URL, aba **Body → JSON**, e conferir o cabeçalho `Content-Type: application/json`.
- **Caça aos erros** em `POST /api/eco` e `POST /api/batatas`:
  - JSON quebrado (tirar uma aspa ou vírgula) → **400**
  - Corpo vazio → 400
  - Batata sem `nome` ou com `preco: "caro"` → **400**, e o campo `detalhes` diz qual campo está errado
  - Trocar o `Content-Type` para `text/plain` → **415**
- Pergunta: "De quem é a culpa nesses erros? Do cliente ou do servidor?" (4xx: do cliente).
- **Classificação (usa o Quadro 5):** para cada erro, a dupla anota se foi 4xx, 5xx ou sem código. Para provocar um "sem código", peça para errarem o domínio de propósito (ex.: `https://<app>-errado.fly.dev`): o cliente mostra um erro de DNS/conexão e **nenhum** status HTTP.

**Etapa C, com o `curl` no terminal, ~10 min:**
```bash
curl.exe https://<app>.fly.dev/api/ola
curl.exe -i https://<app>.fly.dev/api/batatas/1         # -i mostra status e cabeçalhos
curl.exe https://<app>.fly.dev/api/requisicao           # compare o User-Agent com o do navegador!
curl.exe -v https://<app>.fly.dev/api/ola               # -v mostra TUDO (ver seção 5)
```
POST com corpo (ver as dicas de PowerShell na seção 4):
```bash
curl.exe -i -X POST https://<app>.fly.dev/api/batatas -H "Content-Type: application/json" --data "@batata.json"
```

**Métodos menos conhecidos (Quadro 5), com os ~10 min extras:**
```bash
curl.exe -I https://<app>.fly.dev/api/imagens/batata.png      # HEAD: só os cabeçalhos (veja Content-Length)
curl.exe -i -X OPTIONS https://<app>.fly.dev/api/batatas/1    # OPTIONS: o cabeçalho Allow lista os métodos aceitos
curl.exe -i -X DELETE https://<app>.fly.dev/api/ola            # método errado para o endereço → 405 com cabeçalho Allow
```

**Fechamento (oral, 2 min):** "Fizemos o mesmo POST de 3 jeitos. O que mudou para o servidor?" → só o `User-Agent`. O resto era a mesma mensagem HTTP. Num app de verdade, quem faz essa requisição é o **código** (o `fetch` do front-end, o celular…).

---

### Prática 3 (3h47–3h55): token, 401 × 403

1. `GET /api/perfil` sem token → **401**.
2. `POST /api/auth/login` com o usuário de demonstração (`aluno` / `senha-demo`) → copiar o `tokenAcesso`. Quem quiser a própria carteira cria a conta antes em `POST /api/auth/registro` (com apelido, nunca o nome).
3. No Swagger, clicar em **Authorize** e colar o token. Repetir o `GET /api/perfil` → **200**. Abrir as DevTools e achar o cabeçalho `Authorization: Bearer ...` indo na requisição.
4. `GET /api/admin` com o token de aluno → **403**. "O servidor sabe quem você é, mas você não pode."
5. **(Se der tempo) O token é secreto?** No console do navegador (F12 → Console):
   ```js
   JSON.parse(atob("COLE_O_TOKEN_AQUI".split(".")[1]))
   ```
   O conteúdo aparece em texto, inclusive um campo `aviso` que a API colocou lá de propósito! → o JWT é **assinado**, não criptografado. Por isso o token só pode viajar por **HTTPS**, e por isso nunca se põe senha dentro dele.
   🗣️ Prefira decodificar no console em vez de colar em sites como jwt.io. Com token de demonstração não tem problema, mas é bom criar o hábito de **não colar tokens reais em sites de terceiros**.
6. **(Se der tempo) O pregão.** Com o token, cada dupla compra e vende batatas em `POST /api/ordens` (`{"ticker": "FRIT3", "tipo": "compra", "quantidade": 10}`) e confere a `GET /api/carteira`. Cada compra sobe o preço da batata, e saldo insuficiente dá **409**. Projete o `GET /api/ranking` para ver quem está mais rico.

---

## 4. Dicas de terminal no Windows (evitam metade das dúvidas)

- No **Windows PowerShell 5.1**, `curl` é um **apelido** do `Invoke-WebRequest`, que tem outra sintaxe. Sempre digite **`curl.exe`**.
- Passar JSON entre aspas no PowerShell é chato por causa do escape das aspas. Duas saídas simples:
  1. Salvar o corpo num arquivo `batata.json` e usar `--data "@produto.json"` (com aspas, porque o `@` é especial no PowerShell).
  2. Usar o **Prompt de Comando (cmd)**, onde funciona assim:
     `curl -X POST URL -H "Content-Type: application/json" -d "{\"ticker\":\"MOUS3\",\"nome\":\"Batata Mouse\",\"setor\":\"gourmet\",\"preco\":50}"`
- Se houver **Git Bash** nos PCs, os exemplos de `curl` da internet funcionam sem adaptação.
- **Bônus: mais uma ferramenta.** O PowerShell tem um cliente HTTP nativo:
  ```powershell
  $API = "https://<app>.fly.dev"
  Invoke-RestMethod "$API/api/batatas?setor=gourmet"
  $body = @{ ticker = "MOUS3"; nome = "Batata Mouse"; setor = "gourmet"; preco = 50 } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$API/api/batatas" -ContentType "application/json" -Body $body
  ```

---

## 5. Momentos para ligar com a 1ª metade da aula

Estes momentos dão sentido à parte teórica e são o que torna a prática mais do que "apertar botão".

1. **`curl -v` mostra as camadas.** Projete a saída e aponte, linha por linha:
   - `Trying 66.x.x.x:443... Connected` → **IP** (camada de rede) + **porta 443** + conexão **TCP** aberta (o handshake aconteceu aqui)
   - linhas de `TLS`/`schannel` → o **TLS** do HTTPS sendo negociado (Quadro 8). O `curl.exe` do Windows mostra poucos detalhes do certificado, então mostre o certificado também pelo **cadeado do navegador** (emissor, validade, domínio).
   - `ALPN: server accepted h2` → navegador e servidor combinaram usar **HTTP/2**
   - linhas com `>` → a **requisição** que saiu (igual ao Quadro 6)
   - linhas com `<` → a **resposta** que voltou
   - Compare com `curl.exe -v --http1.1 ...` para ver a versão mudar.
2. **`fly logs` ao vivo no projetor.** Cada requisição dos alunos aparece no servidor em tempo real. Ver o próprio `POST` chegando ("olha o seu aí!") engaja muito essa idade e materializa o cliente-servidor. A API já loga uma linha amigável por requisição, com ícone, método, caminho, status, tempo, ferramenta usada e usuário logado (ex.: `✅ POST /api/ordens → 201 (12 ms) — curl 👤 aluno`).
3. **Proxy e versão do protocolo.** O navegador fala HTTP/2 com o Fly.io, mas o `/api/requisicao` provavelmente mostra `HTTP/1.1` (e o `/api/seguranca` mostra os cabeçalhos `X-Forwarded-*` que o proxy adicionou). Isso acontece porque o **proxy do Fly** termina o TLS e, por padrão, repassa para a aplicação em HTTP/1.1. É um bom gancho para "existem intermediários no caminho", e é exatamente a observação que está no `Pratica.md`. (Vale conferir no deploy antes da aula.)
4. **Latência.** Na aba Rede, a coluna "Tempo" mostra quanto cada requisição demorou. Com o `/api/demora?ms=3000` e `curl.exe --max-time 2 ...`, dá para ver um **timeout do cliente**: o servidor responderia, mas o cliente desistiu antes.

---

## 6. Desafios bônus (para duplas rápidas)

| Desafio | Como | Conceito |
|---|---|---|
| Cache | `GET /api/cache/publico` nas DevTools: achar `Cache-Control: max-age=60` | cache |
| 304 | `curl.exe -i /api/etag` → copiar o `ETag` → `curl.exe -i -H "If-None-Match: <etag>" /api/etag`. Depois que alguém compra batatas, o ETag muda e volta o 200. | 304 Not Modified, economia de banda |
| Timeout | `curl.exe --max-time 2 "/api/demora?ms=3000"` | latência × timeout |
| Limite | Chamar `GET /api/limite` 6 vezes seguidas, com o cabeçalho `X-Aluno: <apelido>` | 429 + `Retry-After` |
| Upload | `curl.exe -F "arquivo=@foto.png" /api/arquivos` | `multipart/form-data` |
| Paginação | `GET /api/historico?ticker=FRIT3&pagina=2&limite=30` | listas grandes em páginas |
| Redirecionamento | `curl.exe -i http://<app>.fly.dev/api/ola` (sem S) | 301/308 + cabeçalho `Location` |
| Código | No console do navegador: `fetch("/api/batatas").then(r => r.json()).then(console.log)` | é assim que o front-end chama a API |
| Mentir pro servidor | `curl.exe -H "User-Agent: Navegador-do-Batman" /api/requisicao` | o cliente controla os cabeçalhos: o servidor não deve confiar cegamente neles |

---

## 7. O que a API já resolve para a aula

A API em `pratica/` já vem com as decisões que evitam problemas com 30 alunos ao mesmo tempo:

- **Rate limit só no `/api/limite`**, contado por usuário (token), pelo cabeçalho `X-Aluno` ou pelo IP. O resto da API não tem limite, porque o laboratório inteiro sai pelo mesmo IP público (NAT). Isso dá um ótimo gancho para NAT e IP público × privado na aula 06.
- **Dados das duplas protegidos:** as 14 batatas oficiais não podem ser alteradas nem apagadas (403); cada dupla cria e mexe nas suas.
- **Reset** em `POST /api/admin/reset`, só com o token do `professor`. Os IDs voltam para 1 e os tokens antigos deixam de valer.
- **Mensagens de erro em português**, com `dica` e, no 400, a lista `detalhes` dizendo qual campo está errado.
- **405 com `Allow`** quando o caminho existe mas o método não, e **OPTIONS** respondendo os métodos aceitos.
- **CORS liberado**, **Swagger em `/docs`** com exemplos preenchidos e botão **Authorize**.
- **Limites:** corpo até 100 KB, upload até 1 MB (nada é guardado), textos com tamanho máximo. Não há filtro de palavrões: o que os alunos escrevem e aparece para a turma são os apelidos no `/api/ranking` e os nomes das batatas, então vale combinar as regras antes.
- **Custo:** o Fly.io cobra por uso, mas o app só existe entre o `scripts/subir-aula.ps1` e o `scripts/derrubar-aula.ps1`, então o custo é só o tempo da aula.

---

## 8. Ficha de requisições (entregar ao final, uma por dupla)

> Avaliação formativa. Imprimir ou escrever no quadro para copiarem.

**Dupla:** ______________________

| # | Ferramenta | Método | URL (caminho) | Status | Um cabeçalho que você viu | O que aconteceu? |
|---|---|---|---|---|---|---|
| 1 | Navegador | GET | /api/ola | | | |
| 2 | Navegador | GET | /api/batatas/99999 | | | |
| 3 | Swagger | POST | /api/batatas | | Location: | |
| 4 | Swagger | PATCH | | | | |
| 5 | Swagger | DELETE | | | | |
| 6 | Cliente gráfico | POST | /api/eco (JSON quebrado) | | | |
| 7 | curl | GET | /api/requisicao | | User-Agent: | |
| 8 | Swagger | GET | /api/perfil (sem token) | | | |
| 9 | Swagger | GET | /api/admin (com token de aluno) | | | |

**Perguntas finais:**
1. Qual a diferença entre o `User-Agent` do navegador e o do curl? Por que o servidor recebeu valores diferentes?
2. Qual a diferença entre o 401 e o 403 que vocês receberam?
3. O token que vocês receberam é secreto? Por que ele precisa de HTTPS?

---

## 9. Roteiro do aluno (colinha)

```
API:      https://<app>.fly.dev
SWAGGER:  https://<app>.fly.dev/docs
LOGIN:    aluno / senha-demo   (ou crie sua conta: POST /api/auth/registro)

NAVEGADOR → F12 → aba "Rede" (Network) → clique na requisição
  Cabeçalhos (Headers) | Resposta (Response) | Tempo (Timing)

SWAGGER → abra o endpoint → "Try it out" → preencha → "Execute"
  Token: botão "Authorize" → cole o token

CURL (no PowerShell digite curl.exe)
  curl.exe URL                     GET simples
  curl.exe -i URL                  mostra status + cabeçalhos
  curl.exe -v URL                  mostra TUDO (TCP, TLS, requisição, resposta)
  curl.exe -X POST URL -H "Content-Type: application/json" --data "@arquivo.json"
  curl.exe -H "Authorization: Bearer TOKEN" URL

BOLSA DE BATATAS
  GET  /api/batatas         lista (filtros: ?setor=&precoMin=&precoMax=&pagina=)
  GET  /api/batatas/1       uma batata
  POST /api/batatas         cria a sua batata
  POST /api/auth/login      pega o token
  POST /api/ordens          compra/vende (com token)
  GET  /api/carteira        seu saldo (com token)
  GET  /api/ranking         quem está mais rico

MÉTODOS:  GET ler | POST criar | PUT substituir | PATCH alterar parte | DELETE apagar
STATUS:   2xx ok | 3xx redireciona | 4xx erro do cliente | 5xx erro do servidor
          200 OK | 201 Created | 204 No Content | 400 Bad Request
          401 sem login | 403 sem permissão | 404 não existe | 500 erro no servidor
```
