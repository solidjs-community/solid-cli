import { downloadRepo } from "@begit/core";
import { join } from "node:path";
import { GIT_IGNORE, handleTSConversion } from "./helpers";
import { writeFileSync } from "node:fs";

const VANILLA_TEMPLATES = ["ts"] as const;
type VanillaTemplate = (typeof VANILLA_TEMPLATES)[number];

type CreateVanillaArgs = {
    template: VanillaTemplate,
    destination: string,
}
export const createVanillaTS = async ({ template, destination }: CreateVanillaArgs) => {
    return await downloadRepo({ repo: { owner: "solidjs", name: "templates", subdir: template }, dest: destination });
}

export const createVanillaJS = async ({ template, destination }: CreateVanillaArgs) => {
    // Create typescript project in `<destination>/.project`
    // then transpile this to javascript and clean up
    const tempDir = join(destination, ".project");
    await createVanillaTS({ template, destination: tempDir })
    await handleTSConversion(tempDir, destination);
    // Add .gitignore
    writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
}