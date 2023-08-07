import UnoCss from "unocss/vite";
import { defineConfig } from "vite";
export default defineConfig({
	plugins: [
		UnoCss({
			flag2: false,
		}),
	],
});
