import * as p from "@clack/prompts";
import { isSolidStart } from "@solid-cli/utils";
import { createRoute } from "../../../../core/src/lib/start/add_route";
import { cancelable, spinnerify } from "@solid-cli/ui";
const handleAutocompleteRoute = async () => {
	const path = await cancelable(
		p.text({
			message: "Please provide a path for the route",
			placeholder: "/user/login",
			validate(value) {
				if (!value.length) return "Path is required";
			},
		}),
	);
	const name = await cancelable(
		p.text({
			message: "Please provide a name for the route",

			validate(value) {
				if (!value.length) return "Name for route is required";
			},
		}),
	);

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
