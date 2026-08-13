---
"create-solid": minor
"@solid-cli/create": minor
---

Solid 2.0 template support

- New "Solid 2.0" top-level project type scaffolding the `solid-v2/*` templates from solidjs/templates (basic, bare, fullstack, fullstack-tanstack, with-\*). Listed first but not preselected while Solid 2.0 core is a release candidate; existing flags (`-s`, `-v`, `-l`, `--v2`) keep their meaning, plus new `--solid` and `--ssr` flags.
- Optional streaming SSR on templates that support it (currently `basic`): a scaffold-time flip that sets `ssr: true` in `vite.config.ts`, adds the generic production `server.js`, and points the `start` script at it. Defaults to No.
- JavaScript variants of the Solid 2.0 templates via the existing sucrase TS→JS conversion (no `index.html` rewrite; `.ts`/`.tsx` references inside `vite.config` are retargeted, `.d.ts` files dropped, minimal `jsconfig.json`).
- Template lists, subdir paths and per-template flags are now read from a `templates.json` manifest at the templates repo HEAD (2s timeout), with silent fallback to the baked-in lists — so new templates and future repo reorganizations no longer require a CLI release.
- Template tarball downloads can be pinned to a templates-repo ref per CLI release (`TEMPLATES_REF`, overridable via `SOLID_CLI_TEMPLATES_REF`).
