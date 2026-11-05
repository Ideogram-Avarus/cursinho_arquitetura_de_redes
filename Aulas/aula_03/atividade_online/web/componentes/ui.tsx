// Componentes base no estilo Material 3, feitos só com Tailwind.
// Alvos de toque com pelo menos 48 px no celular (min-h-12).
import clsx from "clsx";
import { useId, useLayoutEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icone, type NomeIcone } from "./Icone";

type Variante = "filled" | "tonal" | "outlined" | "text";

const VARIANTES: Record<Variante, string> = {
  filled: "bg-primary text-on-primary shadow-sm",
  tonal: "bg-secondary-container text-on-secondary-container",
  outlined: "border border-outline text-primary",
  text: "text-primary",
};

export function Botao({
  variante = "filled",
  icone,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; icone?: NomeIcone }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "camada-estado inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium sm:min-h-10",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTES[variante],
        className,
      )}
    >
      {icone && <Icone nome={icone} className="size-[18px]" />}
      {children}
    </button>
  );
}

export function Cartao({
  className,
  children,
  destaque,
}: {
  className?: string;
  children: ReactNode;
  destaque?: boolean;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl p-4 sm:p-5",
        destaque ? "bg-surface-container-high" : "bg-surface-container-low",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Chip de escolha: um entre vários (role="radio" dentro de um grupo). */
export function Chip({
  selecionado,
  onClick,
  disabled,
  children,
  certo,
}: {
  selecionado: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  certo?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionado}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "camada-estado inline-flex min-h-12 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium sm:min-h-9 sm:px-3",
        selecionado
          ? "border-transparent bg-secondary-container text-on-secondary-container"
          : "border-outline-variant text-on-surface-variant",
        certo && "ring-2 ring-primary",
        disabled && "cursor-default",
        disabled && !selecionado && "opacity-50",
      )}
    >
      {/* No celular o ✓ fica de fora para os 5 chips caberem numa linha; a cor já mostra a escolha. */}
      {selecionado && <Icone nome="check" className="hidden size-4 sm:block" />}
      {children}
    </button>
  );
}

export function GrupoDeChips<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  disabled,
}: {
  opcoes: readonly T[];
  valor: T | undefined;
  aoMudar: (v: T | undefined) => void;
  rotulo: string;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="flex flex-wrap gap-1.5 sm:gap-2">
      {opcoes.map((o) => (
        <Chip
          key={o}
          selecionado={valor === o}
          disabled={disabled}
          // Tocar de novo no chip escolhido desmarca.
          onClick={() => aoMudar(valor === o ? undefined : o)}
        >
          {o}
        </Chip>
      ))}
    </div>
  );
}

/** Botões segmentados do Material 3 (ex.: S C P ? e as fases da aula). */
export function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  disabled,
  rotulos,
  dicas,
  obrigatorio,
}: {
  opcoes: readonly T[];
  valor: T | null | undefined;
  aoMudar: (v: T | null) => void;
  rotulo: string;
  disabled?: boolean;
  /** Texto de cada botão (padrão: o próprio valor). */
  rotulos?: Partial<Record<T, string>>;
  /** Dica ao passar o mouse. */
  dicas?: Partial<Record<T, string>>;
  /** Sem desmarcar ao tocar de novo (ex.: a fase da aula). */
  obrigatorio?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className="inline-flex overflow-hidden rounded-full border border-outline"
    >
      {opcoes.map((o, i) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={valor === o}
          title={dicas?.[o]}
          disabled={disabled}
          onClick={() => aoMudar(valor === o && !obrigatorio ? null : o)}
          className={clsx(
            "camada-estado flex min-h-12 min-w-12 flex-1 items-center justify-center gap-1 px-3 text-sm font-medium whitespace-nowrap sm:min-h-10",
            i > 0 && "border-l border-outline",
            valor === o ? "bg-secondary-container text-on-secondary-container" : "text-on-surface",
            disabled && "cursor-default opacity-60",
          )}
        >
          {valor === o && <Icone nome="check" className="size-4" />}
          {rotulos?.[o] ?? o}
        </button>
      ))}
    </div>
  );
}

/** Campo de texto "outlined". Sem `curto`, é uma caixa que cresce conforme o texto. */
export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  aoSair,
  curto,
  disabled,
  placeholder,
  tipo = "text",
  autoComplete,
  cor = "primary",
}: {
  rotulo: ReactNode;
  valor: string;
  aoMudar: (v: string) => void;
  aoSair?: () => void;
  curto?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tipo?: "text" | "password";
  autoComplete?: string;
  cor?: "primary" | "tertiary";
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  // A caixa cresce com o texto (sem barra de rolagem).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [valor]);

  const classes = clsx(
    "w-full rounded-md border bg-transparent px-3 py-3 text-base text-on-surface outline-none placeholder:text-on-surface-variant/60",
    "disabled:border-outline-variant disabled:text-on-surface/80",
    cor === "tertiary"
      ? "border-tertiary focus:border-2 focus:border-tertiary focus:px-[11px] focus:py-[11px]"
      : "border-outline focus:border-2 focus:border-primary focus:px-[11px] focus:py-[11px]",
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={clsx("text-sm", cor === "tertiary" ? "text-tertiary" : "text-on-surface-variant")}>
        {rotulo}
      </label>
      {curto ? (
        <input
          id={id}
          type={tipo}
          value={valor}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={2000}
          onChange={(e) => aoMudar(e.target.value)}
          onBlur={aoSair}
          className={clsx(classes, "min-h-12")}
        />
      ) : (
        <textarea
          id={id}
          ref={ref}
          rows={2}
          value={valor}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={2000}
          onChange={(e) => aoMudar(e.target.value)}
          onBlur={aoSair}
          className={clsx(classes, "resize-none")}
        />
      )}
    </div>
  );
}

export function Abas<T extends string>({
  abas,
  ativa,
  aoMudar,
}: {
  abas: { id: T; rotulo: ReactNode }[];
  ativa: T;
  aoMudar: (id: T) => void;
}) {
  return (
    <div role="tablist" className="flex overflow-x-auto border-b border-outline-variant">
      {abas.map((a) => (
        <button
          key={a.id}
          type="button"
          role="tab"
          aria-selected={a.id === ativa}
          onClick={() => aoMudar(a.id)}
          className={clsx(
            "camada-estado relative flex min-h-12 flex-1 shrink-0 flex-col items-center justify-center px-4 text-sm font-medium whitespace-nowrap",
            a.id === ativa ? "text-primary" : "text-on-surface-variant",
          )}
        >
          {a.rotulo}
          {a.id === ativa && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary" />}
        </button>
      ))}
    </div>
  );
}

export function BarraDeProgresso({ valor, className }: { valor: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valor * 100)}
      className={clsx("h-1 overflow-hidden rounded-full bg-surface-container-highest", className)}
    >
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${valor * 100}%` }} />
    </div>
  );
}

export function Aviso({
  tipo = "info",
  children,
  aoFechar,
}: {
  tipo?: "info" | "erro" | "alerta";
  children: ReactNode;
  aoFechar?: () => void;
}) {
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={clsx(
        "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
        tipo === "erro" && "bg-error-container text-on-error-container",
        tipo === "alerta" && "bg-tertiary-container text-on-tertiary-container",
        tipo === "info" && "bg-secondary-container text-on-secondary-container",
      )}
    >
      {tipo !== "info" && <Icone nome="alerta" className="mt-0.5" />}
      <div className="flex-1">{children}</div>
      {aoFechar && (
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="camada-estado -m-2 rounded-full p-2">
          <Icone nome="fechar" />
        </button>
      )}
    </div>
  );
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-on-surface-variant">
      <div className="size-10 animate-spin rounded-full border-4 border-primary-container border-t-primary" />
      <p>{texto}</p>
    </div>
  );
}
