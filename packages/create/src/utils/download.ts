import { downloadRepo, GithubFetcher } from "@begit/core";

export const TEMPLATES_REPO = { owner: "solidjs", name: "templates" } as const;

/**
 * Optional ref (tag, sha or branch) of solidjs/templates that scaffold downloads
 * are pinned to. Set this at release time (e.g. to a `cli-x.y` tag) so a published
 * CLI version keeps scaffolding exactly what it was tested against, immune to
 * later reorganizations of the templates repo. `undefined` means live HEAD of the
 * default branch, which is the historical behavior.
 */
export const TEMPLATES_REF: string | undefined = "b3d888d309c7173feee2b4cb3ddba8e788af559b";

/** `SOLID_CLI_TEMPLATES_REF` overrides the baked ref, for testing against branches/forks */
export const templatesRef = () => process.env.SOLID_CLI_TEMPLATES_REF || TEMPLATES_REF;

/** Downloads `subdir` of the solidjs/templates repo (at the pinned ref, if any) into `destination` */
export const downloadTemplate = (subdir: string, destination: string) =>
	downloadRepo({ repo: { ...TEMPLATES_REPO, subdir, hash: templatesRef() }, dest: destination }, GithubFetcher);
