import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { log } from "@clack/prompts";

/**
 * Flips a client-mode Solid 2.0 template (e.g. `solid-v2/basic`) into streaming SSR.
 * The delta to the `solid-v2/fullstack` template's server posture is exactly three files:
 * 1. `vite.config.ts` — add `ssr: true` to the `solid({ start: true, ... })` call
 * 2. `server.js` — the generic production node server (verbatim from `solid-v2/fullstack`)
 * 3. `package.json` — point the `start` script at that server
 */

export const SSR_ANCHOR = "solid({ start: true";
/** The template documents the flip with this hint; drop it once the flip is applied */
export const SSR_HINT_COMMENT = " // add `ssr: true` for streaming SSR";
export const SSR_START_SCRIPT = "node --env-file-if-exists=.env server.js";

/**
 * Production node server for turnkey SSR apps. Verbatim copy of
 * `solid-v2/fullstack/server.js` from the templates repo — fully generic: it only
 * imports node builtins plus the built server bundle's `handleRequest`.
 * Regenerate with `node scripts/gen-ssr-flip-server.mjs <server.js> <this file>`
 * when the template changes.
 */
// @generated-server-js-start
export const SERVER_JS = `// The entire production server for a turnkey SSR app: static client assets
// plus one import — the built server bundle's \`handleRequest\`, an
// adapter-agnostic web \`Request -> Response\` handler that streams the SSR
// render, resolves hashed client assets through the build manifest, and
// (with serverFunctions enabled) serves the \`/_server\` endpoint too. The
// node <-> web plumbing below is the only glue; on a web-native platform
// (workers, Deno, Bun.serve) \`handleRequest\` is used directly.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { handleRequest } from './dist/server/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function webRequest(req, res) {
  const url = new URL(req.url || '/', \`http://\${req.headers.host || \`localhost:\${port}\`}\`);
  const method = req.method || 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : Readable.toWeb(req);
  // A client that goes away fires the request's AbortSignal, so handlers can
  // cancel streamed renders and in-flight work. The response's 'close' also
  // fires on normal completion; writableEnded tells the two apart.
  // (Technique from srvx's Node adapter, github.com/h3js/srvx.)
  const controller = new AbortController();
  res.once('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  return new Request(url, {
    method,
    headers: req.headers,
    body,
    signal: controller.signal,
    ...(body ? { duplex: 'half' } : {}),
  });
}

async function sendWebResponse(res, response) {
  res.statusCode = response.status;
  // set-cookie is the one header that must not be comma-joined.
  const cookies = response.headers.getSetCookie?.();
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') res.setHeader(key, value);
  });
  if (cookies?.length) res.setHeader('set-cookie', cookies);
  // HEAD gets the head only — and the body must be cancelled, not pumped
  // into node's discarded HEAD writes. (Technique from srvx.)
  if (!response.body || res.req?.method === 'HEAD') {
    response.body?.cancel().catch(() => {});
    res.end();
    return;
  }
  const reader = response.body.getReader();
  res.on('close', () => {
    reader.cancel().catch(() => {});
  });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Backpressure: an unchecked res.write loop buffers the whole body in
      // memory when the client reads slowly. The 'drain' wait must also
      // settle on 'close'/'error' — a response whose client already went
      // away never emits 'drain', which would park this promise (and the
      // render it holds) forever.
      if (res.destroyed) return;
      if (!res.write(value)) {
        const drained = await new Promise((resolve) => {
          const settle = (ok) => {
            res.off('drain', onDrain);
            res.off('close', onGone);
            res.off('error', onGone);
            resolve(ok);
          };
          const onDrain = () => settle(true);
          const onGone = () => settle(false);
          res.once('drain', onDrain);
          res.once('close', onGone);
          res.once('error', onGone);
        });
        // Client gone mid-stream; the 'close' handler cancels the reader.
        if (!drained) return;
      }
    }
    res.end();
  } catch {
    res.destroy();
  }
}

const server = createServer(async (req, res) => {
  const url = req.url || '/';

  // Static client assets first.
  if (url !== '/' && !url.includes('..')) {
    try {
      const content = readFileSync(path.resolve(__dirname, 'dist/client' + url.split('?')[0]));
      res.setHeader('Content-Type', MIME[path.extname(url)] || 'application/octet-stream');
      res.end(content);
      return;
    } catch {
      // Fall through to the handler (SSR routes, /_server, ...).
    }
  }

  try {
    // The \`options.event\` seam: extra fields spread into the request event,
    // conventionally the platform's raw request as \`nativeEvent\` — app code
    // reads it back via getRequestEvent() (e.g. the client IP from
    // event.nativeEvent.socket.remoteAddress on bare Node).
    const response = await handleRequest(webRequest(req, res), { event: { nativeEvent: req } });
    await sendWebResponse(res, response);
  } catch (e) {
    console.error(e);
    // Once the head is on the wire a 500 can't be written any more —
    // touching statusCode would throw ERR_HTTP_HEADERS_SENT.
    if (res.headersSent) return res.destroy();
    res.statusCode = 500;
    res.end(e.message);
  }
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;
// @generated-server-js-end

/**
 * Applies the SSR flip to a scaffolded template directory (before any TS→JS conversion,
 * so the config edit happens on the `.ts` source).
 *
 * If the `vite.config.ts` anchor is missing (template drifted), the flip is aborted
 * with a warning instead of writing a broken config, leaving a working client-mode app.
 */
export const applySsrFlip = async (dir: string): Promise<boolean> => {
	const viteConfigPath = join(dir, "vite.config.ts");
	const abort = (reason: string) => {
		log.warn(`Skipping SSR setup: ${reason}. The project was created in client mode.`);
		return false;
	};
	if (!existsSync(viteConfigPath)) return abort("no vite.config.ts found");
	const viteConfig = (await readFile(viteConfigPath)).toString();
	if (!viteConfig.includes(SSR_ANCHOR)) return abort("unrecognized vite.config.ts");

	await writeFile(
		viteConfigPath,
		viteConfig.replace(SSR_ANCHOR, `${SSR_ANCHOR}, ssr: true`).replace(SSR_HINT_COMMENT, ""),
	);
	await writeFile(join(dir, "server.js"), SERVER_JS);

	const packageJsonPath = join(dir, "package.json");
	const packageJson = JSON.parse((await readFile(packageJsonPath)).toString());
	packageJson.scripts = { ...packageJson.scripts, start: SSR_START_SCRIPT };
	await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
	return true;
};
