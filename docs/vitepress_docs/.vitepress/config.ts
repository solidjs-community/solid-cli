import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Solid-cli Docs",
	description: "Documentation for the solid cli",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Guide", link: "/markdown-examples" },
		],

		sidebar: [
			{
				text: "Getting started",
				items: [
					{ text: "About", link: "/about" },
					{ text: "Installation", link: "/installation" },
				],
			},
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/solidjs-community/solid-cli",
			},
		],
	},
});
