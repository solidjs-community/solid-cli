import { TextOptions } from "@clack/prompts";
interface Field extends TextOptions {
    name: string;
    render?: (this: Field) => Promise<any>;
}
export declare const form: (fields: Field[]) => Promise<{
    name: string;
    value: any;
}[]>;
export {};
