import { Prompt } from "@clack/core";
import { TextOptions } from "@clack/prompts";
export type Option = {
    value: any;
    label?: string;
    hint?: string;
    group?: string;
};
interface AutocompleteTextOptions<T extends Option> extends TextOptions {
    options: () => T[];
    render: (this: Omit<AutocompleteText<T>, "prompt">) => string | void;
}
declare class AutocompleteText<T extends Option> extends Prompt {
    valueWithCursor: string;
    options: T[];
    get __cursor(): number;
    cursor: number;
    filteredOptions: T[];
    selected: T[];
    mode: "search" | "explore";
    private toggleValue;
    constructor(opts: AutocompleteTextOptions<T>);
    private customKeyPress;
}
export declare const autocomplete: <T extends Option>(opts: Omit<AutocompleteTextOptions<T>, "render">) => Promise<symbol | T[]>;
export {};
