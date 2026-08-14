# @solid-cli/create

## 0.10.0

### Minor Changes

- Always scaffold from the latest templates

  - Template downloads are no longer pinned to a baked-in solidjs/templates commit. Scaffolds come from live HEAD of the default branch, matching the `templates.json` manifest, so upstream template changes and dependency repins reach users without a CLI release.
  - Removed the `SOLID_CLI_TEMPLATES_REF` environment override that shipped in 0.9.0, along with the pin it existed to escape.
  - HEAD is resolved to a commit sha before downloading so the tarball can be cached under it and reused by later scaffolds. That lookup goes through api.github.com, which is rate limited to 60 requests/hour for unauthenticated users, so any failure — rate limited, offline, slow — falls back to fetching HEAD from the archive endpoint directly, uncached.
  - Solid 2.0 is labelled "Solid 2.0 (RC)" in the project picker now that Solid 2.0 core is a release candidate. It stays listed first but not preselected.

## 0.9.0

### Minor Changes

- 68caa9f: Solid 2.0 template support

  - New "Solid 2.0" top-level project type scaffolding the `solid-v2/*` templates from solidjs/templates (basic, bare, fullstack, fullstack-tanstack, with-\*). Listed first but not preselected while Solid 2.0 core is in beta; existing flags (`-s`, `-v`, `-l`, `--v2`) keep their meaning, plus new `--solid` and `--ssr` flags.
  - Optional streaming SSR on templates that support it (currently `basic`): a scaffold-time flip that sets `ssr: true` in `vite.config.ts`, adds the generic production `server.js`, and points the `start` script at it. Defaults to No.
  - JavaScript variants of the Solid 2.0 templates via the existing sucrase TS→JS conversion (no `index.html` rewrite; `.ts`/`.tsx` references inside `vite.config` are retargeted, `.d.ts` files dropped, minimal `jsconfig.json`).
  - Template lists, subdir paths and per-template flags are now read from a `templates.json` manifest at the templates repo HEAD (2s timeout), with silent fallback to the baked-in lists — so new templates and future repo reorganizations no longer require a CLI release.

## 0.8.1

### Patch Changes

- 5621942: SolidStart v2 is now Stable

## 0.8.0

### Minor Changes

- support fetching without the github API (so fetching should no work when hitting the github api limit)

### Patch Changes

- Updated dependencies
  - @solid-cli/utils@0.7.0

## 0.6.14

### Patch Changes

- update dependencies and add to solid start v2 templates list
- Updated dependencies
  - @solid-cli/utils@0.6.3

## 0.6.13

### Patch Changes

- Keep showing `pnpm install` & `pnpm dev` commands when initialising a project in the current working directory

## 0.6.12

### Patch Changes

- Update dependencies, add new template, and remove `cd` command if project is created in working directory
- Updated dependencies
  - @solid-cli/utils@0.6.2

## 0.6.11

### Patch Changes

- Rename `with-pages-router-file-based` to `with-vite-plugin-pages`

## 0.6.10

### Patch Changes

- Fetch Vanilla templates from /vanilla subdirectory of solidjs/templates, rather than from repo root

## 0.6.9

### Patch Changes

- Fetch Start templates from solidjs/templates, rather than the Start repo

## 0.6.8

### Patch Changes

- Correctly perform TS->JS conversion by disabling ES transforms and preserving dynamic imports

## 0.6.7

### Patch Changes

- Add `with-strict-csp` template to Start

## 0.6.6

### Patch Changes

- Add CLI flags for creating `vanilla` and `library` projects

## 0.6.5

### Patch Changes

- Don't add "Created with Solid CLI" text to README if it's already there

## 0.6.4

### Patch Changes

- Update link in text added to project READMEs

## 0.6.3

### Patch Changes

- Add more command line arguments

## 0.6.1

### Patch Changes

- Fix regression from 0.5.x (.gitignore wasn't being written to new projects)

## 0.6.0

### Patch Changes

- @solid-cli/utils@0.6.0
