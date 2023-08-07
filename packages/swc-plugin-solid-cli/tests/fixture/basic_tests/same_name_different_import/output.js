import UnoCss from "unocss/vite";
import UnoCss1 from "not_unocss/vite";
export default defineConfig({
	plugins: [UnoCss1({}), UnoCss({})],
});
