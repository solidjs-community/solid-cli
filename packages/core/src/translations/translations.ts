import { createSignal } from "@solid-cli/reactivity";
import { SL, Translations } from "./types";
export const [locale, setLocale] = createSignal(Intl.DateTimeFormat().resolvedOptions().locale);

const TRANSLATIONS = {
  ACTION_ADD: {
    en: "Add an integration",
    es: "Añadir una integración",
    fr: "Ajouter une intégration",
    ja: "統合を追加する",
  },
} as const satisfies Translations;

export const t = new Proxy(TRANSLATIONS, {
  get(target, p, receiver) {
    const l = locale() as SL;
    const text = target[p as keyof typeof target];
    if (l in text) {
      return text[l as keyof typeof text];
    }
    return text["en"];
  },
}) as unknown as Record<keyof typeof TRANSLATIONS, string>;
