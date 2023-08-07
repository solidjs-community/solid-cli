import * as p from "@clack/prompts";
import { isSolidStart } from "../../lib/utils/solid_start";
import { createRoute } from "../../lib/start/add_route";
import { spinnerify } from "../../lib/utils/ui";
const handleAutocompleteRoute = async () => {
	const path = (
		await p.text({ message: "Please provide a path for the route", placeholder: "/user/login" })
	).toString();
	const res = (await p.text({ message: "Please provide a name for the route" })).toString();
	const name = res === "" ? undefined : res;
	await handleRoute(path, name);
};
export const handleRoute = async (path?: string, name?: string) => {
	if (!(await isSolidStart())) {
		p.log.error("Cannot run command. Your project doesn't include solid-start");
		return;
	}
	if (!path) {
		await handleAutocompleteRoute();
		return;
	}
	await spinnerify({
		startText: "Creating new route",
		finishText: "Route created",
		fn: () => createRoute(path, name),
	});
};
