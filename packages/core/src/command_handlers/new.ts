import * as p from "@clack/prompts";
import { openInBrowser } from "../lib/utils/open";
import { PM, detect } from "detect-package-manager";
import { execa } from "execa";
import { cancelable } from "../components/autocomplete/utils";
import { spinnerify } from "../lib/utils/ui";

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
export const getRunner = (pM: PM) => {
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
  const template = await cancelable(
    p.select({
      message: "Which template would you like to use?",
      initialValue: "ts",
      options: startSupported.map((s) => ({ label: s, value: s })),
    }),
  );

  const pM = await detect();
  await spinnerify({
    startText: "Creating Project",
    finishText: "Project successfully created! 🎉",
    fn: () =>
      execa(
        getRunner(pM),
        ["degit", `solidjs/solid-start/examples/${template}#main`, projectName].filter((e) => e !== null) as string[],
      ),
  });
  p.log.info(`To get started, run:
  - cd ${projectName}
  - npm install
  - npm run dev`);
};

const handleAutocompleteNew = async () => {
  const name = await cancelable(
    p.text({ message: "Project Name", placeholder: "solid-project", defaultValue: "solid-project" }),
  );

  const isStart = await cancelable(p.confirm({ message: "Is this a Solid-Start project?" }));

  if (isStart) {
    handleNewStartProject(name);
    return;
  }

  const template = await cancelable(
    p.select({
      message: "Template",
      initialValue: "ts",
      options: localSupported.map((s) => ({ label: s, value: s })),
    }),
  );

  const pM = await detect();
  const projectName = name ?? "solid-project";
  await spinnerify({
    startText: "Creating project",
    finishText: "Project successfully created! 🎉",
    fn: () =>
      execa(
        getRunner(pM),
        ["degit", `solidjs/templates/${template}`, projectName].filter((e) => e !== null) as string[],
      ),
  });

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
    await spinnerify({
      startText: `Opening ${variation} in browser`,
      finishText: "Successfully Opened in Browser",
      fn: () => openInBrowser(`https://solid.new/${variation}`),
    });
    return;
  }

  const pM = await detect();
  await spinnerify({
    startText: "Creating project",
    finishText: "Project successfully created! 🎉",
    fn: () =>
      execa(
        getRunner(pM),
        ["degit", `solidjs/templates/${variation}`, name ?? null].filter((e) => e !== null) as string[],
      ),
  });
  p.log.info(`To get started, run:
  - cd ${name}
  - npm install
  - npm run dev`);
};
