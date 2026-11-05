---
description: Avalia as respostas abertas da atividade da aula 03 (site no ar) e resume os erros mais comuns para a revisão
argument-hint: "[url do site] [questões, ex.: A10,C7] [--revisar]"
allowed-tools: Bash(curl:*), Read, Write
---

<!--
  Comando do Claude Code. Para usar como /corrigir-aula03, copie este arquivo para
  .claude/commands/corrigir-aula03.md na raiz do repositório (veja o README desta pasta).
  Sem copiar, dá para pedir ao Claude: "siga Aulas/aula_03/atividade_online/corrigir-aula03.md com a URL ...".
-->

Você vai avaliar as partes ABERTAS (texto livre) da atividade de diagnóstico da aula 03 de Arquitetura de Redes, pelo site que está no ar. É o intervalo da aula: seja rápido e consistente.

Argumentos recebidos: `$ARGUMENTS`

- **URL do site:** o primeiro argumento que começa com `http`. Se não tiver, use `https://atividade-redes-aula03.fly.dev` (o `app` de `Aulas/aula_03/atividade_online/fly.toml`).
- **Questões:** um argumento como `A10,C7,B2` limita a essas questões. Sem ele, avalie todas.
- **`--revisar`:** inclui as que já foram avaliadas (`todas=true`), para refazer. Sem ele, só as pendentes.

## Passos

1. **Ler as pendentes:**
   `curl -s "<URL>/api/professor/avaliacoes?questoes=<lista ou vazio>&todas=<true|false>"`
   A resposta traz `instrucoes`, e para cada questão: `enunciado`, `referencia` (resposta esperada e erros comuns, do gabarito comentado) e `respostas`. Cada resposta tem `usuarioId`, `versao` e `campos` (`aberta: true` é o que você avalia; os campos fechados vêm só para dar contexto). Se `total` for 0, diga que não há nada pendente e pare.

2. **Avaliar** cada resposta seguindo as `instrucoes` e a `referencia`:
   - `certa`, `parcial` ou `errada`, olhando só as partes abertas da resposta.
   - Na dúvida entre dois níveis, fique com o mais generoso: é diagnóstico, não prova.
   - Seja consistente: respostas com a mesma ideia recebem a mesma avaliação.
   - `comentario`: uma frase curta em português, escrita **para o aluno**, que vai ler na fase de correção (o que faltou ou o equívoco, com gentileza). Use `null` quando a resposta estiver certa e não houver nada a dizer.
   - Não invente nada que o aluno não escreveu. Não há nomes: não tente identificar ninguém.

3. **Gravar em lote.** Escreva um arquivo JSON (com a ferramenta Write, num diretório temporário) no formato abaixo, copiando `usuarioId`, `questaoId` e `versao` exatamente como vieram. Mande no máximo 300 avaliações por arquivo:

   ```json
   {
     "avaliacoes": [
       {
         "usuarioId": 3,
         "questaoId": "A10",
         "versao": "2026-11-03T14:05:12.345Z",
         "avaliacao": "parcial",
         "comentario": "Você acertou que não dá, mas faltou explicar o porquê."
       }
     ]
   }
   ```

   `curl -s -X PUT "<URL>/api/professor/avaliacoes" -H "Content-Type: application/json" --data-binary @<arquivo>`
   A resposta diz `salvas` e `ignoradas`. Se alguma foi ignorada porque "o aluno mudou a resposta", leia de novo só essas questões e avalie a versão nova (uma vez só).

4. **Não faça mais nada no site:** só o GET e o PUT de `/api/professor/avaliacoes`. Não mude a fase, não importe nem exporte.

## Relatório final (no chat, curto, para o professor ler no intervalo)

- Uma linha com o total: quantas avaliadas, quantas certas / parciais / erradas.
- As questões com **mais erradas e parciais** primeiro (no máximo 8). Para cada uma: a contagem (certa / parcial / errada) e o equívoco mais comum, em uma frase, com um trecho curto de exemplo entre aspas.
- No fim, 2 ou 3 sugestões do que enfatizar na revisão (blocos R1 redes, R2 UDP × TCP, R3 HTTP).
- No máximo umas 25 linhas. Lembre que o painel (`<URL>/professor`) já mostra tudo atualizado.
