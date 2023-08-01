import { SL, Translations } from "./types";

const TRANSLATIONS = {
  ACTION_ADD: {
    en: "Add an integration",
    es: "Añadir una integración",
    fr: "Ajouter une intégration",
    ja: "統合を追加する",
  },
} as const satisfies Translations;

const locale = () => Intl.DateTimeFormat().resolvedOptions().locale;

export const t = Object.defineProperties(
  {},
  Object.keys(TRANSLATIONS).reduce((acc, s) => {
    acc[s as keyof typeof acc] = {
      get() {
        const l = locale() as SL;
        const text = TRANSLATIONS[s as keyof typeof TRANSLATIONS];
        if (l in text) {
          return text[l as keyof typeof text];
        }
        return text["en"];
      },
    };

    return acc;
  }, {} as any),
) as Record<keyof typeof TRANSLATIONS, string>;
