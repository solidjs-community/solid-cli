export const SupportedLanguages = ["en", "fr", "es", "de", "ru", "zh", "ja", "ko"] as const;
export type SL = (typeof SupportedLanguages)[number];

export type LanguageTranslations = Partial<Record<SL, string>>;
export type TemplateFunction = (...args: any[]) => LanguageTranslations;
export type Translations = Record<string, LanguageTranslations | TemplateFunction>;
