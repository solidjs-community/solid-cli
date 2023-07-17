import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Solid-CLI Docs",
	description: "Documentation for the Solid CLI",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Guide", link: "/about" },
		],

		sidebar: [
			{
				text: "Getting started",
				items: [
					{ text: "About", link: "/about" },
					{ text: "Installation", link: "/installation" },
					{ text: "Basic Commands", link: "/basic-commands" },
					{ text: "Solid-Start Commands", link: "/start-commands" },
				],
			},
			{ text: "Supported Integrations", link: "/supported-integrations" },
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/solidjs-community/solid-cli",
			},
		],
	},
});
