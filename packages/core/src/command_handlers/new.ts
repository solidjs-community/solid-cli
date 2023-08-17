import * as p from "@clack/prompts";
import { openInBrowser } from "@solid-cli/utils";
import { PM, detect } from "detect-package-manager";
import { execa } from "execa";
import { cancelable, spinnerify } from "@solid-cli/ui";
import { t } from "@solid-cli/utils";
import { insertAtEnd } from "@solid-cli/utils/fs";
import { flushQueue } from "@solid-cli/utils/updates";

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
const modifyReadme = async (name: string) => {
	await insertAtEnd(
		`${name}/README.md`,
		"\n## This project was created with the [Solid CLI](https://solid-cli.netlify.app)\n",
	);
	await flushQueue();
};
const handleNewStartProject = async (projectName: string) => {
	const template = await cancelable(
		p.select({
			message: t.NEW_START,
			initialValue: "ts",
			options: startSupported.map((s) => ({ label: s, value: s })),
		}),
	);

	const pM = await detect();
	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: () =>
			execa(
				getRunner(pM),
				["degit", `solidjs/solid-start/examples/${template}#main`, projectName].filter((e) => e !== null) as string[],
			),
	});
	await modifyReadme(projectName);
	p.log.info(`${t.GET_STARTED}
  - cd ${projectName}
  - npm install
  - npm run dev`);
};

const handleAutocompleteNew = async () => {
	const name = await cancelable(
		p.text({ message: t.PROJECT_NAME, placeholder: "solid-project", defaultValue: "solid-project" }),
	);

	const isStart = await cancelable(p.confirm({ message: t.IS_START_PROJECT }));

	if (isStart) {
		handleNewStartProject(name);
		return;
	}

	const template = (await cancelable(
		p.select({
			message: t.TEMPLATE,
			initialValue: "ts",
			options: localSupported.map((s) => ({ label: s, value: s })),
		}),
	)) as unknown as AllSupported;

	await handleNew(template, name);
};
export const handleNew = async (variation?: AllSupported, name?: string, stackblitz: boolean = false) => {
	if (!variation) {
		await handleAutocompleteNew();
		return;
	}

	if (stackblitz) {
		await spinnerify({
			startText: t.OPENING_IN_BROWSER(variation),
			finishText: t.OPENED_IN_BROWSER,
			fn: () => openInBrowser(`https://solid.new/${variation}`),
		});
		return;
	}

	const pM = await detect();

	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: () =>
			execa(
				getRunner(pM),
				["degit", `solidjs/templates/${variation}`, name ?? null].filter((e) => e !== null) as string[],
			),
	});
	await modifyReadme(name ?? variation);
	p.log.info(`${t.GET_STARTED}
  - cd ${name}
  - npm install
  - npm run dev`);
};
