export const SupportedLanguages = ["en", "fr", "es", "de", "ru", "zh", "ja", "ko"] as const;
export type SL = (typeof SupportedLanguages)[number];

export type Translations = Record<string, Partial<Record<SL, string>>>;
