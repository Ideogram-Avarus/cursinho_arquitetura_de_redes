# HTTP Sandbox — Laboratório Prático de Redes e APIs

## Objetivo

Disponibilizar uma API REST com Swagger UI para que os alunos explorem, na prática, os principais conceitos do protocolo HTTP e da comunicação HTTPS.

O sandbox deve permitir que os alunos façam requisições GET, POST, PUT, PATCH e DELETE, observem os cabeçalhos, parâmetros, corpos das requisições, códigos de status, autenticação e comportamento do servidor.

A aplicação será hospedada no Fly.io, com documentação interativa pelo Swagger UI e persistência de dados em um banco de dados.

A ideia é que cada endpoint ensine um conceito específico de redes ou desenvolvimento de APIs, permitindo que os alunos aprendam experimentando e observando os resultados.

---

## 1. Grupo: primeiros passos com HTTP

### GET /api/hello
Retorna uma mensagem simples de boas-vindas.

Exemplo de resposta:
{
  "message": "Olá, mundo!",
  "timestamp": "2026-10-22T13:00:00Z"
}

**Conceitos explorados:**
- Método GET.
- URL e caminho do recurso.
- Corpo da resposta.
- Cabeçalhos HTTP.
- Código de status 200 OK.
- Diferença entre requisição e resposta.

### GET /api/request-info
Retorna informações sobre a requisição recebida pelo servidor.

Exemplo de resposta:
{
  "method": "GET",
  "path": "/api/request-info",
  "protocol": "HTTP/1.1",
  "userAgent": "Mozilla/5.0...",
  "accept": "application/json",
  "contentType": null,
  "requestId": "abc123"
}

**Conceitos explorados:**
- Cabeçalhos HTTP.
- User-Agent.
- Accept e Content-Type.
- Diferença entre dados enviados pelo cliente e informações geradas pelo servidor.
- Limitações de confiar em cabeçalhos enviados pelo próprio cliente.

Observação: o protocolo informado deve representar o protocolo HTTP recebido pela aplicação, e não necessariamente o protocolo usado em cada trecho da conexão até o cliente.

### GET /api/status
Retorna o estado da aplicação e informações básicas de funcionamento.

Exemplo de resposta:
{
  "status": "ok",
  "service": "http-sandbox",
  "version": "1.0.0"
}

**Conceitos explorados:**
- APIs de monitoramento.
- Código 200.
- Diferença entre disponibilidade da aplicação e disponibilidade de suas dependências.

---

## 2. Grupo: parâmetros de URL

### GET /api/products
Lista produtos fictícios.

Parâmetros de consulta:
- `category`: filtra por categoria.
- `minPrice`: preço mínimo.
- `maxPrice`: preço máximo.
- `search`: pesquisa por nome.
- `page`: número da página.
- `limit`: quantidade de resultados.

Exemplo:
GET /api/products?category=electronics&minPrice=100&maxPrice=500&page=1&limit=10

**Conceitos explorados:**
- Query parameters.
- Codificação de caracteres na URL.
- Filtros e paginação.
- Diferença entre parâmetros de caminho e de consulta.

### GET /api/products/{id}
Retorna os detalhes de um produto específico.

Exemplo:
GET /api/products/42

**Conceitos explorados:**
- Parâmetros de caminho (*path parameters*).
- Identificação de recursos.
- Código 404 Not Found para um produto inexistente.
- Diferença entre recurso inexistente e erro interno.

### GET /api/search
Pesquisa em um conjunto de dados fictícios.

Parâmetro:
- `q`: texto a pesquisar.

Exemplos:
GET /api/search?q=notebook
GET /api/search?q=redes%20de%20computadores

**Conceitos explorados:**
- Codificação de espaços e caracteres especiais.
- Caracteres reservados em URLs.
- Diferença entre URL e corpo da requisição.

---

## 3. Grupo: respostas HTTP e tratamento de erros

### GET /api/status-codes/{code}
Produz uma resposta HTTP com um código de status escolhido dentro de uma lista segura de códigos permitidos.

Exemplos:
- 200 OK.
- 201 Created.
- 204 No Content.
- 400 Bad Request.
- 401 Unauthorized.
- 403 Forbidden.
- 404 Not Found.
- 409 Conflict.
- 429 Too Many Requests.
- 500 Internal Server Error.

**Conceitos explorados:**
- Classes de status 2xx, 3xx, 4xx e 5xx.
- Diferença entre sucesso, erro do cliente e erro do servidor.
- Cabeçalho HTTP e corpo da resposta.
- Por que um status HTTP não é a mesma coisa que um erro de negócio.

O endpoint deve apenas simular os status permitidos, sem provocar falhas reais na infraestrutura.

### GET /api/delayed-response
Recebe um parâmetro `delayMs` e devolve uma resposta após o atraso solicitado, limitado a um intervalo seguro.

**Conceitos explorados:**
- Latência.
- Tempo de resposta.
- Timeout do cliente.
- Diferença entre demora da aplicação e perda de conexão.

### GET /api/not-found
Retorna deliberadamente um 404 Not Found.

### GET /api/teapot
Retorna 418 I'm a Teapot, como exemplo de código incomum e curiosidade histórica do HTTP.

**Conceitos explorados:**
- Tratamento de erros.
- Interpretação de códigos de status.
- Como clientes e ferramentas de desenvolvimento apresentam respostas incomuns.

---

## 4. Grupo: envio de dados com POST

### POST /api/echo
Recebe JSON e devolve os dados recebidos, sem persistência.

Exemplo de corpo:
{
  "name": "Maria",
  "age": 25,
  "course": "Desenvolvimento de Sistemas"
}

**Conceitos explorados:**
- Método POST.
- Corpo da requisição.
- JSON.
- Cabeçalho Content-Type: application/json.
- Diferença entre os dados enviados e os dados devolvidos pelo servidor.

Criar exemplos de erros para JSON inválido, corpo vazio e Content-Type incorreto.

### POST /api/products
Cadastra um produto fictício e retorna o recurso criado.

Exemplo de corpo:
{
  "name": "Teclado",
  "price": 120.00,
  "category": "electronics"
}

Resposta esperada:
- Código 201 Created.
- Corpo contendo o produto criado e seu identificador.
- Cabeçalho Location apontando para o recurso criado.

**Conceitos explorados:**
- Criação de recursos.
- Validação de dados.
- Persistência no banco.
- Código 201 Created.
- Cabeçalho Location.
- Diferença entre requisição e representação do recurso criado.

### POST /api/feedback
Registra uma avaliação dos alunos sobre o laboratório.

Campos:
- `studentAlias`: apelido fictício.
- `rating`: nota de 1 a 5.
- `comment`: comentário opcional.

**Conceitos explorados:**
- Envio de formulários por API.
- Validação de entrada.
- Dados persistidos no banco.
- Respostas de sucesso e de validação.

Não coletar nome completo, matrícula, e-mail pessoal ou outros dados pessoais dos alunos.

---

## 5. Grupo: alteração e exclusão de recursos

Utilizar os produtos cadastrados no grupo anterior.

### PUT /api/products/{id}
Substitui integralmente os dados editáveis de um produto.

**Conceitos explorados:**
- PUT.
- Substituição de recurso.
- Diferença entre PUT e PATCH.
- Validação de campos obrigatórios.

### PATCH /api/products/{id}
Altera parcialmente um produto.

Exemplo de corpo:
{
  "price": 99.90
}

**Conceitos explorados:**
- Atualização parcial.
- Campos opcionais.
- Diferenças entre PUT e PATCH.

### DELETE /api/products/{id}
Exclui um produto criado no sandbox.

**Conceitos explorados:**
- Método DELETE.
- Código 204 No Content.
- Persistência e remoção de dados.
- Idempotência dos métodos HTTP.

O sandbox deve limitar as alterações aos recursos didáticos e permitir a restauração dos dados de demonstração.

---

## 6. Grupo: autenticação e autorização

Criar um fluxo simples de autenticação com tokens fictícios, sem integrar contas reais.

### POST /api/auth/login
Recebe credenciais de demonstração e devolve um token de acesso temporário.

Exemplo de corpo:
{
  "username": "aluno",
  "password": "senha-demo"
}

Resposta:
{
  "accessToken": "token-ficticio",
  "tokenType": "Bearer",
  "expiresIn": 900
}

O token deve ser gerado e validado pelo servidor, ter expiração e não conceder acesso a dados sensíveis.

### GET /api/profile
Retorna um perfil fictício.

Sem token:
- 401 Unauthorized.

Com token válido:
- 200 OK.

### GET /api/admin
Exige um token associado ao perfil administrativo de demonstração.

Com token válido, mas sem permissão:
- 403 Forbidden.

Com token válido e permissão administrativa:
- 200 OK.

### POST /api/auth/refresh
Opcional: demonstra a renovação de tokens, caso o conteúdo de autenticação seja aprofundado.

**Conceitos explorados:**
- Autenticação versus autorização.
- Cabeçalho Authorization.
- Bearer tokens.
- Diferença entre 401 e 403.
- Expiração de credenciais.
- Por que HTTPS é importante para proteger credenciais e tokens em trânsito.

O Swagger deve permitir que os alunos utilizem o botão Authorize para informar o token e testar endpoints protegidos.

---

## 7. Grupo: imagens e arquivos

### GET /api/images/sample.png
Retorna uma imagem PNG de demonstração.

### GET /api/images/sample.jpg
Retorna uma imagem JPEG.

### GET /api/images/metadata
Retorna metadados das imagens disponíveis.

Exemplo:
{
  "filename": "sample.png",
  "contentType": "image/png",
  "sizeBytes": 2048
}

### POST /api/files
Recebe um arquivo pequeno usando multipart/form-data.

**Conceitos explorados:**
- Content-Type.
- Respostas binárias.
- Diferença entre JSON e arquivos.
- multipart/form-data.
- Download e upload.
- Cabeçalho Content-Disposition.

Utilizar apenas arquivos pequenos, limitar tamanho e tipos permitidos e não permitir execução de arquivos enviados.

---

## 8. Grupo: cache e cabeçalhos HTTP

### GET /api/cache/public
Retorna uma resposta com cabeçalhos de cache explícitos.

Exemplo:
Cache-Control: public, max-age=60

### GET /api/cache/no-store
Retorna uma resposta com:
Cache-Control: no-store

### GET /api/etag
Retorna uma representação com um ETag.

Permitir que o aluno envie o cabeçalho If-None-Match para testar uma resposta 304 Not Modified.

**Conceitos explorados:**
- Cache-Control.
- ETag.
- If-None-Match.
- 304 Not Modified.
- Economia de banda e redução de requisições desnecessárias.

---

## 9. Grupo: HTTPS e segurança de transporte

O sandbox deve estar disponível por HTTPS, com certificado TLS válido fornecido pela infraestrutura de hospedagem.

### GET /api/security-info
Retorna informações sobre o contexto da requisição recebido pelo servidor.

**Conceitos explorados:**
- Diferença entre HTTP e HTTPS.
- TLS.
- Certificados digitais.
- Proteção dos dados em trânsito.
- Limitações de confiar em cabeçalhos de proxy.

Evitar disponibilizar uma versão HTTP pública que transmita senhas ou tokens sem criptografia. Caso exista um endpoint HTTP para demonstração, ele deve redirecionar para HTTPS e não aceitar credenciais.

---

## 10. Grupo: limites e controle de requisições

### GET /api/rate-limit
Aplica um limite baixo e controlado de requisições por cliente ou token.

**Conceitos explorados:**
- Rate limiting.
- Código 429 Too Many Requests.
- Cabeçalhos de limite e tempo de espera, quando implementados.
- Proteção de serviços contra uso excessivo.

### GET /api/paginated-records
Retorna uma coleção de registros fictícios com paginação.

**Conceitos explorados:**
- Query parameters.
- Paginação.
- Volume de dados.
- Latência e tamanho da resposta.

---

## 11. Ideias de atividades práticas

### Atividade A — Explorando uma requisição GET
1. Executar GET /api/products.
2. Adicionar filtros e paginação.
3. Comparar as respostas.
4. Observar a URL, o status HTTP e os cabeçalhos.

### Atividade B — Criando um recurso
1. Executar POST /api/products.
2. Observar o corpo enviado.
3. Identificar o código 201 e o cabeçalho Location.
4. Consultar o recurso criado com GET.
5. Alterar o preço com PATCH.
6. Excluir o recurso com DELETE.

### Atividade C — Investigando erros
1. Consultar um produto inexistente.
2. Enviar JSON inválido.
3. Executar uma requisição sem autenticação.
4. Comparar as respostas 400, 401, 403 e 404.
5. Identificar o que veio do servidor e o que foi exibido pela ferramenta.

### Atividade D — Testando autenticação
1. Consultar /api/profile sem token.
2. Fazer login e obter um token.
3. Configurar o token no Swagger.
4. Repetir a requisição.
5. Acessar /api/admin com um token sem permissão.
6. Comparar 401 e 403.

### Atividade E — Observando cache e desempenho
1. Consultar /api/cache/public várias vezes.
2. Observar os cabeçalhos.
3. Testar o ETag e o If-None-Match.
4. Comparar o tamanho das respostas e os códigos retornados.

---

## 12. Requisitos do sandbox

- Documentação interativa Swagger UI.
- Dados de demonstração e exemplos prontos.
- Banco de dados persistente para os exercícios de CRUD.
- Validação rigorosa dos corpos e parâmetros.
- Limites de tamanho de requisição, upload e tempo de resposta.
- Rate limiting para proteger o serviço público.
- Tokens temporários e contas fictícias.
- Endpoints de demonstração sem dependência de credenciais externas.
- Logs básicos para demonstrar o processamento das requisições, sem registrar senhas ou tokens.
- Possibilidade de restaurar os dados iniciais.
- Respostas consistentes e documentadas para os códigos de status.
- Compatibilidade com Swagger UI, curl e ferramentas como Postman.

## Escopo recomendado para a primeira versão

Para evitar que o desenvolvimento do sandbox consuma mais tempo do que a preparação da aula, começar com:

1. GET /api/hello
2. GET /api/request-info
3. GET /api/products com filtros
4. GET /api/products/{id}
5. POST /api/echo
6. POST /api/products
7. PATCH /api/products/{id}
8. DELETE /api/products/{id}
9. GET /api/status-codes/{code}
10. POST /api/auth/login
11. GET /api/profile
12. GET /api/images/sample.png
13. GET /api/cache/public
14. GET /api/etag

Essa primeira versão já permite explorar métodos HTTP, parâmetros, JSON, cabeçalhos, status, persistência, autenticação, imagens, cache e HTTPS. Os demais endpoints podem ser adicionados conforme o avanço do curso.