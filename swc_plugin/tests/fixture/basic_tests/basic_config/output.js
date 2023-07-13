import UnoCss from "unocss/vite";
import { defineConfig } from "vite";
export default defineConfig({
	plugins: [solid(), UnoCss({})],
});
