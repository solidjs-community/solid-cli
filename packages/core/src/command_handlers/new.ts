import * as p from "@clack/prompts";
import { openInBrowser } from "../lib/utils/open";
import { PM, detect } from "detect-package-manager";
import { execa } from "execa";
import { cancelable } from "../components/autocomplete/utils";
import { t } from "../translations";
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

	const template = await cancelable(
		p.select({
			message: t.TEMPLATE,
			initialValue: "ts",
			options: localSupported.map((s) => ({ label: s, value: s })),
		}),
	);

	const pM = await detect();
	const projectName = name ?? "solid-project";
	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: () =>
			execa(
				getRunner(pM),
				["degit", `solidjs/templates/${template}`, projectName].filter((e) => e !== null) as string[],
			),
	});

	p.log.info(`${t.GET_STARTED}
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
	p.log.info(`${t.GET_STARTED}
  - cd ${name}
  - npm install
  - npm run dev`);
};
