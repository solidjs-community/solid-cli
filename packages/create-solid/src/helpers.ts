import { copyFileSync, Dirent, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { transform } from "sucrase";

const recurseFiles = (startPath: string, cb: (file: Dirent, startPath: string) => void) => {
    startPath = resolve(startPath);

    const files = readdirSync(startPath, { withFileTypes: true });

    for (const file of files) {
        cb(file, startPath);
    }
};

export const readFileToString = async (path: string) => {
    return (await readFile(path)).toString();
};
const convertToJS = async (file: Dirent, startPath: string) => {
    const src = join(startPath, file.name);
    const dest = resolve(startPath.replace(".solid-start", ""), file.name);
    if (file.isDirectory()) {
        mkdirSync(dest, { recursive: true });
        recurseFiles(resolve(startPath, file.name), convertToJS);
    } else if (file.isFile()) {
        if (src.endsWith(".ts") || src.endsWith(".tsx")) {
            let { code } = transform(await readFileToString(src), {
                transforms: ["typescript", "jsx"],
                jsxRuntime: "preserve",
            });

            writeFileSync(dest.replace(".ts", ".js"), code, { flag: "wx" });
        } else {
            copyFileSync(src, dest);
        }
    }
};
export const handleTSConversion = async (tempDir: string, projectName: string) => {
    await rm(resolve(tempDir, "tsconfig.json"));
    writeFileSync(
        resolve(projectName, "jsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: {
                    jsx: "preserve",
                    jsxImportSource: "solid-js",
                    paths: {
                        "~/*": ["./src/*"],
                    },
                },
            },
            null,
            2,
        ),
        { flag: "wx" },
    );

    // Convert all ts files in temp directory into js
    recurseFiles(tempDir, convertToJS);

    // Remove temp directory
    await rm(join(process.cwd(), tempDir), {
        recursive: true,
        force: true,
    });
};

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