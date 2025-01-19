import { downloadRepo } from "@begit/core";
import { GIT_IGNORE, StartTemplate } from "./helpers"
import { join } from "path";
import { writeFileSync } from "fs";
import { handleTSConversion } from "./utils/ts-conversion"
export type CreateStartArgs = {
    template: StartTemplate,
    destination: string,
}

export const createStartTS = ({ template, destination }: CreateStartArgs) => {
    return downloadRepo({
        repo: { owner: "solidjs", name: "solid-start", subdir: `examples/${template}` },
        dest: destination,
    });
}

export const createStartJS = async ({ template, destination }: CreateStartArgs) => {
    // Create typescript project in `<destination>/.project`
    // then transpile this to javascript and clean up
    const tempDir = join(destination, ".project");
    await createStartTS({ template, destination: tempDir })
    await handleTSConversion(tempDir, destination);
    // Add .gitignore
    writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
}

export const createStart = (args: CreateStartArgs, js?: boolean) => {
    if (js) {
        return createStartJS(args);
    }
    return createStartTS(args);
}