import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { parse, stringify } from "smol-toml";
const defaultConfig = {
  lang: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
} as Record<string, any>;
export class ConfigHandler {
  private config: Record<string, any> = defaultConfig;
  private configPath: string = homedir() + "/solid-cli.config.toml";
  async readConfig() {
    return await readFile(this.configPath, "utf-8");
  }
  async parseConfig() {
    let config;
    try {
      config = await this.readConfig();
    } catch {
      console.log("Reading failed");
      await this.writeConfig();
      return;
    }
    this.config = parse(config);
  }
  stringifyConfig() {
    return stringify(this.config);
  }
  async writeConfig() {
    await writeFile(this.configPath, this.stringifyConfig());
  }
  field(field: string) {
    const res = this.config[field];
    if (!res && defaultConfig[field]) this.config[field] = defaultConfig[field];
    return this.config[field];
  }
  setField(field: string, value: any) {
    this.config[field] = value;
  }
}
// Kinda hacky
export const configInst = new ConfigHandler();