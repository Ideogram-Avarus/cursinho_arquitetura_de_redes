// Página "meio escondida": exportar e importar. Só um link discreto no rodapé do painel
// (e o lembrete de export) trazem até aqui.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { LayoutDoPainel, useEstado } from "../componentes/painel";
import { Aviso, Botao, Cartao } from "../componentes/ui";
import { api, ErroApi, mensagemDeErro } from "../lib/api";
import { tempoDesde, useAgora } from "../lib/tempo";

interface ResultadoImport {
  usuarios: number;
  respostas: number;
  fase: string;
}

export function ProfessorDados() {
  const agora = useAgora();
  const cliente = useQueryClient();
  const estado = useEstado();
  const arquivo = useRef<HTMLInputElement>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const baixar = (formato: "json" | "csv") => {
    // Download direto: o servidor manda Content-Disposition: attachment.
    window.location.href = `/api/professor/exportar?formato=${formato}`;
    setTimeout(() => void cliente.invalidateQueries({ queryKey: ["estado"] }), 1500);
  };

  const importar = useMutation({
    mutationFn: (dados: unknown) => api<ResultadoImport>("POST", "/professor/importar", dados),
    onSuccess: () => void cliente.invalidateQueries(),
  });

  const aoEscolher = async (lista: FileList | null) => {
    const f = lista?.[0];
    if (arquivo.current) arquivo.current.value = "";
    if (!f) return;
    setErroLocal(null);
    importar.reset();
    let dados: unknown;
    try {
      dados = JSON.parse(await f.text());
    } catch {
      setErroLocal(`"${f.name}" não é um JSON válido.`);
      return;
    }
    if (confirm(`Substituir TODOS os dados do site pelo conteúdo de "${f.name}"?`)) importar.mutate(dados);
  };

  return (
    <LayoutDoPainel titulo="Dados da aula" voltar="/professor">
      <Aviso tipo="alerta">
        O banco vive só dentro da máquina do Fly: se ela reiniciar, tudo some.{" "}
        <strong>Exporte o JSON de tempos em tempos</strong> (o lembrete no topo fica amarelo depois de 20 min).
      </Aviso>

      <div className="grid gap-4 md:grid-cols-2">
        <Cartao className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Exportar</h2>
          <p className="text-sm text-on-surface-variant">
            Último export:{" "}
            <strong className="text-on-surface">{tempoDesde(estado.data?.ultimoExport ?? null, agora)}</strong>
          </p>
          <Botao icone="baixar" onClick={() => baixar("json")} className="self-start">
            Exportar JSON (para guardar e reimportar)
          </Botao>
          <Botao variante="tonal" icone="baixar" onClick={() => baixar("csv")} className="self-start">
            Exportar CSV (abre no Excel)
          </Botao>
          <p className="text-xs text-on-surface-variant">
            O JSON tem tudo: alunos (com o hash da senha), respostas e a fase. O CSV tem uma linha por aluno × questão.
          </p>
        </Cartao>

        <Cartao className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Importar JSON</h2>
          <p className="text-sm text-on-surface-variant">
            Restaura o banco a partir de um JSON exportado aqui. <strong>Substitui tudo</strong> o que está no site. Se
            o arquivo não estiver no formato do export, nada é mexido.
          </p>
          <input
            ref={arquivo}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void aoEscolher(e.target.files)}
          />
          <Botao
            variante="outlined"
            icone="enviar"
            disabled={importar.isPending}
            onClick={() => arquivo.current?.click()}
            className="self-start"
          >
            {importar.isPending ? "Importando…" : "Escolher arquivo JSON"}
          </Botao>
          {importar.data && (
            <Aviso>
              Pronto: {importar.data.usuarios} alunos e {importar.data.respostas} respostas restaurados (fase “
              {importar.data.fase}”).
            </Aviso>
          )}
          {(erroLocal || importar.error) && (
            <Aviso tipo="erro">
              {erroLocal ??
                (importar.error instanceof ErroApi && importar.error.status === 400
                  ? `O arquivo não está no formato do export: ${importar.error.message}`
                  : mensagemDeErro(importar.error))}
            </Aviso>
          )}
        </Cartao>
      </div>
    </LayoutDoPainel>
  );
}
