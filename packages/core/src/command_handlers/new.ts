import * as p from "@clack/prompts";
import { openInBrowser } from "../lib/utils/open";
import { PM, detect } from "detect-package-manager";
import { execa } from "execa";

const startSupported = [
  "bare",
  "hackernews",
  "todomvc",
  "with-auth",
  "with-authjs",
  "with-mdx",
  "with-prisma",
  "with-solid-styled",
  "with-tailwindcss",
  "with-trpc",
  "with-vitest",
  "with-websocket",
] as const;
const localSupported = ["ts", "js"] as const;
const stackblitzSupported = ["bare"] as const;

type AllSupported = (typeof localSupported)[number] | (typeof stackblitzSupported)[number];
const getRunner = (pM: PM) => {
  switch (pM) {
    case "npm":
      return "npx";
    case "yarn":
      return "npx";
    case "pnpm":
      return "pnpx";
  }
};

const handleNewStartProject = async (projectName: string) => {
  const template = await p.select({
    message: "Which template would you like to use?",
    initialValue: "ts",
    options: startSupported.map((s) => ({ label: s, value: s })),
  });

  if (p.isCancel(template)) {
    p.log.warn("Canceled");
    return;
  }

  const pM = await detect();
  const s = p.spinner();
  s.start("Creating project");

  await execa(
    getRunner(pM),
    ["degit", `solidjs/solid-start/examples/${template}#main`, projectName].filter((e) => e !== null) as string[],
  );

  s.stop("Project successfully created! 🎉");

  p.log.info(`To get started, run:
  - cd ${projectName}
  - npm install
  - npm run dev`);
};

const handleAutocompleteNew = async () => {
  const name = await p.text({ message: "Project Name", placeholder: "solid-project", defaultValue: "solid-project" });

  if (p.isCancel(name)) {
    p.log.warn("Canceled");
    return;
  }

  const isStart = await p.confirm({ message: "Is this a Solid-Start project?" });

  if (p.isCancel(isStart)) {
    p.log.warn("Canceled");
    return;
  }

  if (isStart) {
    handleNewStartProject(name);
    return;
  }

  const template = await p.select({
    message: "Template",
    initialValue: "ts",
    options: localSupported.map((s) => ({ label: s, value: s })),
  });

  if (p.isCancel(template)) {
    p.log.warn("Canceled");
    return;
  }

  const pM = await detect();
  const projectName = name ?? "solid-project";

  const s = p.spinner();
  s.start("Creating project");

  await execa(
    getRunner(pM),
    ["degit", `solidjs/templates/${template}`, projectName].filter((e) => e !== null) as string[],
  );

  s.stop("Project successfully created! 🎉");

  p.log.info(`To get started, run:
  - cd ${projectName}
  - npm install
  - npm run dev`);
};
export const handleNew = async (variation?: AllSupported, name?: string, stackblitz: boolean = false) => {
  if (!variation) {
    await handleAutocompleteNew();
    return;
  }

  if (stackblitz) {
    const s = p.spinner();
    s.start(`Opening ${variation} in browser`);
    await openInBrowser(`https://solid.new/${variation}`);
    s.stop();
    p.log.success("Successfully Opened in Browser");
    return;
  }

  const pM = await detect();

  const s = p.spinner();
  s.start("Creating project");

  await execa(
    getRunner(pM),
    ["degit", `solidjs/templates/${variation}`, name ?? null].filter((e) => e !== null) as string[],
  );

  s.stop("Project successfully created! 🎉");

  p.log.info(`To get started, run:
  - cd ${name}
  - npm install
  - npm run dev`);
};