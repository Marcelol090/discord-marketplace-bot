import i18next from "i18next";
import ptBR from "./locales/pt-BR";
import enUS from "./locales/en-US";

i18next.init({
  fallbackLng: "pt-BR",
  resources: {
    "pt-BR": ptBR,
    "en-US": enUS,
    "en-GB": enUS,
  },
  interpolation: {
    escapeValue: false,
  },
});

export const i18n = i18next;

export function getLocale(discordLocale?: string): string {
  if (!discordLocale) return "pt-BR";
  if (discordLocale.startsWith("en")) return "en-US";
  if (discordLocale.startsWith("pt")) return "pt-BR";
  return "pt-BR";
}