import { command } from "cmd-ts";

export default command({
	name: "custom",
	description: "A completely custom command dynamically imported at runtime!",
	args: {},
	handler() {
		console.log("CUSTOM COMMAND WORKS!!");
	},
});
