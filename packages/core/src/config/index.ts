import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { parse, stringify } from "smol-toml";
const defaultConfig = {
  lang: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
} as Record<string, any>;

export class ConfigHandler {
  private config: Record<string, any> = defaultConfig;
  private configPath: string = join(homedir(), "/solid-cli.config.toml");
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
    if (!this.config[field] && defaultConfig[field]) this.config[field] = defaultConfig[field];
    return this.config[field];
  }
  setField(field: string, value: any) {
    if (!(field in defaultConfig)) {
      throw new Error(`Field ${field} is not a supported field`);
    }
    this.config[field] = value;
  }
}
// Kinda hacky
export const configInst = new ConfigHandler();
