export declare class ConfigHandler {
    private config;
    private configPath;
    readConfig(): Promise<string>;
    parseConfig(): Promise<void>;
    stringifyConfig(): string;
    writeConfig(): Promise<void>;
    field(field: string): any;
    setField(field: string, value: any): void;
}
export declare const configInst: ConfigHandler;
