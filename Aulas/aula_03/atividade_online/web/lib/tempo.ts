import { useEffect, useState } from "react";

/** "agora", "há 3 min", "há 1 h 05". */
export function tempoDesde(iso: string | null, agora: number): string {
  if (!iso) return "nunca";
  const min = Math.floor((agora - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  return `há ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

export const minutosDesde = (iso: string | null, agora: number) =>
  iso ? (agora - new Date(iso).getTime()) / 60_000 : Infinity;

/** O relógio, atualizado de tempos em tempos (para o "há X min" andar sozinho). */
export function useAgora(intervaloMs = 20_000) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return agora;
}
