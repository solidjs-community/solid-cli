import * as p from "@clack/prompts";
import { openInBrowser } from "../lib/utils/open";
import { PM, detect } from "detect-package-manager";
import { execa } from "execa";
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
const handleAutocompleteNew = async () => {
  const project = await p.group({
    name: () => p.text({ message: "Project Name", placeholder: "solid-project" }),
    template: () =>
      p.select({
        message: "Template",
        initialValue: "ts",
        options: localSupported.map((s) => ({ label: s, value: s })),
      }),
  });
  const pM = await detect();
  const projectName = project.name ?? "solid-project";
  const s = p.spinner();
  s.start("Creating project");
  const { stdout } = await execa(
    getRunner(pM),
    ["degit", `solidjs/templates/${project.template}`, projectName].filter((e) => e !== null) as string[],
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
  const { stdout } = await execa(
    getRunner(pM),
    ["degit", `solidjs/templates/${variation}`, name ?? null].filter((e) => e !== null) as string[],
  );
};
