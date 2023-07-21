import { cp } from "fs/promises";

cp("src/lib/wasm", "dist/wasm", { recursive: true });
