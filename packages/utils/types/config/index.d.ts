export declare class ConfigHandler {
    private config;
    private configPath;
    readConfig(): Promise<any>;
    parseConfig(): Promise<void>;
    stringifyConfig(): any;
    writeConfig(): Promise<void>;
    field(field: string): any;
    setField(field: string, value: any): void;
}
export declare const configInst: ConfigHandler;
