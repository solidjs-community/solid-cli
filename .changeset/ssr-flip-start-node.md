---
"create-solid": minor
"@solid-cli/create": minor
---

SSR flip: use the plugin's `start.node` entry instead of a baked `server.js`

- `--ssr` on Solid 2.0 templates that support it (`basic`) now rewrites `solid({ start: true, ... })` to `solid({ start: { node: true }, ssr: true, ... })`. With `@solidjs/vite-plugin` 3.0.0-next.44+, `start.node` makes `vite build` emit a production Node entry at `dist/server/node.js` (static assets, cache headers, `PORT`/`HOST`), so the flip no longer writes a hand-written `server.js` into the scaffold.
- The `start` script becomes `node --env-file-if-exists=.env dist/server/node.js`.
- Removed the embedded `SERVER_JS` copy of `solid-v2/fullstack/server.js` and the `scripts/gen-ssr-flip-server.mjs` generator that kept it in sync; the templates repo deleted that file when it adopted `start.node` (solidjs/templates#304).
