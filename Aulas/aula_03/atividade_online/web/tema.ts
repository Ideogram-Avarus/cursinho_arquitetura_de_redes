// Tema Material 3 (Material You) gerado a partir de UMA cor-semente.
// As cores viram variáveis CSS (--md-primary...) que o Tailwind usa em index.css (bg-primary, text-on-surface...).
// Claro e escuro seguem o sistema do aparelho (prefers-color-scheme).
import {
  argbFromHex,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from "@material/material-color-utilities";

export const COR_SEMENTE = "#0b6bcb";

// nome do token no CSS → cor dinâmica do Material 3
const TOKENS = {
  primary: MaterialDynamicColors.primary,
  "on-primary": MaterialDynamicColors.onPrimary,
  "primary-container": MaterialDynamicColors.primaryContainer,
  "on-primary-container": MaterialDynamicColors.onPrimaryContainer,
  secondary: MaterialDynamicColors.secondary,
  "on-secondary": MaterialDynamicColors.onSecondary,
  "secondary-container": MaterialDynamicColors.secondaryContainer,
  "on-secondary-container": MaterialDynamicColors.onSecondaryContainer,
  tertiary: MaterialDynamicColors.tertiary,
  "on-tertiary": MaterialDynamicColors.onTertiary,
  "tertiary-container": MaterialDynamicColors.tertiaryContainer,
  "on-tertiary-container": MaterialDynamicColors.onTertiaryContainer,
  error: MaterialDynamicColors.error,
  "on-error": MaterialDynamicColors.onError,
  "error-container": MaterialDynamicColors.errorContainer,
  "on-error-container": MaterialDynamicColors.onErrorContainer,
  surface: MaterialDynamicColors.surface,
  "on-surface": MaterialDynamicColors.onSurface,
  "on-surface-variant": MaterialDynamicColors.onSurfaceVariant,
  "surface-container-lowest": MaterialDynamicColors.surfaceContainerLowest,
  "surface-container-low": MaterialDynamicColors.surfaceContainerLow,
  "surface-container": MaterialDynamicColors.surfaceContainer,
  "surface-container-high": MaterialDynamicColors.surfaceContainerHigh,
  "surface-container-highest": MaterialDynamicColors.surfaceContainerHighest,
  outline: MaterialDynamicColors.outline,
  "outline-variant": MaterialDynamicColors.outlineVariant,
  "inverse-surface": MaterialDynamicColors.inverseSurface,
  "inverse-on-surface": MaterialDynamicColors.inverseOnSurface,
  "inverse-primary": MaterialDynamicColors.inversePrimary,
};

function variaveis(escuro: boolean): string {
  const esquema = new SchemeTonalSpot(Hct.fromInt(argbFromHex(COR_SEMENTE)), escuro, 0);
  return Object.entries(TOKENS)
    .map(([nome, cor]) => `--md-${nome}:${hexFromArgb(cor.getArgb(esquema))};`)
    .join("");
}

export function aplicarTema() {
  const estilo = document.createElement("style");
  estilo.id = "tema-material";
  estilo.textContent =
    `:root{color-scheme:light;${variaveis(false)}}` +
    `@media (prefers-color-scheme: dark){:root{color-scheme:dark;${variaveis(true)}}}`;
  document.head.appendChild(estilo);
}
