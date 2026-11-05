// Peças compartilhadas pelas páginas do professor.
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Estado } from "../../shared/esquemas";
import { MARCACOES, ROTULO_MARCACAO, type Marcacao } from "../../shared/questoes";
import { api } from "../lib/api";
import { minutosDesde, tempoDesde, useAgora } from "../lib/tempo";
import { Icone } from "./Icone";

export const COR_MARCACAO: Record<Marcacao, string> = {
  // Cores bem diferentes entre si (a secondary do tema é quase igual à primary).
  S: "bg-primary",
  C: "bg-teal-500",
  P: "bg-amber-500",
  "?": "bg-error",
};

export function useEstado() {
  return useQuery({ queryKey: ["estado"], queryFn: () => api<Estado>("GET", "/estado"), refetchInterval: 5000 });
}

export function LayoutDoPainel({ titulo, voltar, children }: { titulo: string; voltar?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-surface-container px-2 sm:px-4">
        {voltar && (
          <Link
            to={voltar}
            aria-label="Voltar"
            className="camada-estado flex size-12 items-center justify-center rounded-full text-on-surface-variant"
          >
            <Icone nome="voltar" />
          </Link>
        )}
        <h1 className={clsx("flex-1 truncate text-lg font-medium", !voltar && "pl-2")}>{titulo}</h1>
        <LembreteDeExport />
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">{children}</main>
    </div>
  );
}

/** "último export há X min": fica amarelo depois de 20 min. Leva para a página de dados. */
export function LembreteDeExport() {
  const agora = useAgora();
  const { data } = useEstado();
  if (!data) return null;
  const atrasado = minutosDesde(data.ultimoExport, agora) > 20;
  return (
    <Link
      to="/professor/dados"
      title="Exportar os dados"
      className={clsx(
        "camada-estado flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-medium",
        atrasado
          ? "bg-amber-200 text-amber-950 dark:bg-amber-500/30 dark:text-amber-100"
          : "bg-surface-container-highest text-on-surface-variant",
      )}
    >
      <Icone nome={atrasado ? "alerta" : "nuvem"} className="size-4" />
      <span>
        <span className="hidden sm:inline">Último export: </span>
        {tempoDesde(data.ultimoExport, agora)}
      </span>
    </Link>
  );
}

/** Barra empilhada S / C / P / ? */
export function BarraDeMarcacoes({
  marcacoes,
  className,
}: {
  marcacoes: Record<Marcacao, number>;
  className?: string;
}) {
  const total = MARCACOES.reduce((s, m) => s + marcacoes[m], 0);
  if (!total) return <div className={clsx("h-3 rounded-full bg-surface-container-highest", className)} />;
  return (
    <div
      className={clsx("flex h-3 overflow-hidden rounded-full bg-surface-container-highest", className)}
      title={MARCACOES.map((m) => `${m}: ${marcacoes[m]}`).join(" • ")}
    >
      {MARCACOES.map((m) =>
        marcacoes[m] ? (
          <div key={m} className={COR_MARCACAO[m]} style={{ width: `${(marcacoes[m] / total) * 100}%` }} />
        ) : null,
      )}
    </div>
  );
}

export function LegendaDeMarcacoes() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
      {MARCACOES.map((m) => (
        <span key={m} className="flex items-center gap-1.5">
          <span className={clsx("size-3 rounded-sm", COR_MARCACAO[m])} />
          <strong>{m}</strong> {ROTULO_MARCACAO[m]}
        </span>
      ))}
    </div>
  );
}

export function Porcentagem({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="text-on-surface-variant">—</span>;
  const p = Math.round(valor * 100);
  return (
    <span
      className={clsx(
        "rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
        p >= 70 && "bg-primary-container text-on-primary-container",
        p >= 40 && p < 70 && "bg-tertiary-container text-on-tertiary-container",
        p < 40 && "bg-error-container text-on-error-container",
      )}
    >
      {p}%
    </span>
  );
}
