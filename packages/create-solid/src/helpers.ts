export const GIT_IGNORE = `
dist
.solid
.output
.vercel
.netlify
.vinxi
app.config.timestamp_*.js

# Environment
.env
.env*.local

# dependencies
/node_modules

# IDEs and editors
/.idea
.project
.classpath
*.launch
.settings/

# Temp
gitignore

# System Files
.DS_Store
Thumbs.db
`;

import { log, spinner } from "@clack/prompts";
type SpinnerItem<T> = {
    startText: string;
    finishText: string;
    fn: () => Promise<T>;
};
export async function spinnerify<T>(spinners: SpinnerItem<T>): Promise<T>;
export async function spinnerify(spinners: SpinnerItem<any>[]): Promise<any[]>;
export async function spinnerify<T>(spinners: SpinnerItem<any>[] | SpinnerItem<T>) {
    if (!Array.isArray(spinners)) spinners = [spinners];
    let results: any[] = [];
    const s = spinner();
    for (const { startText, finishText, fn } of spinners) {
        s.start(startText);
        results.push(await fn());
        s.stop(finishText);
    }
    return results.length === 1 ? results[0] : results;
}

export const cancelable = async <T = unknown>(prompt: Promise<T | symbol>, cancelMessage: string = "Canceled"): Promise<T> => {
    const value = await prompt;

    if (typeof value === "symbol") {
        log.warn(cancelMessage);
        process.exit(0);
    }

    return value;
};
const VANILLA_TEMPLATES = ["ts"] as const;
export type VanillaTemplate = (typeof VANILLA_TEMPLATES)[number];

const START_TEMPLATES = ["basic"] as const;
export type StartTemplate = (typeof VANILLA_TEMPLATES)[number];
export const getTemplatesList = async (isStart: boolean) => {
    if (isStart) {
        return START_TEMPLATES;
    }
    return VANILLA_TEMPLATES;
}