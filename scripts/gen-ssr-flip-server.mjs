// One-off generator: embeds solid-v2/fullstack/server.js into ssr-flip.ts as an
// escaped template literal, guaranteeing the scaffolded file byte-matches the template.
import { readFileSync, writeFileSync } from "node:fs";

const [src, dest] = process.argv.slice(2);
const content = readFileSync(src, "utf8");
const escaped = content.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const target = readFileSync(dest, "utf8");
const updated = target.replace(
	/(\/\/ @generated-server-js-start\nexport const SERVER_JS = `)[\s\S]*?(`;\n\/\/ @generated-server-js-end)/,
	`$1${escaped}$2`,
);
writeFileSync(dest, updated);
console.log("embedded", content.length, "bytes");
