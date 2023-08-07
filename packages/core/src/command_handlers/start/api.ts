import { isSolidStart } from "../../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { spinnerify } from "../../lib/utils/ui";
import { createApi } from "../../lib/start/add_api";
import { cancelable } from "../../components/autocomplete/utils";

const handleAutocompleteApi = async () => {
	const path = await cancelable(
		p.text({
			message: "Enter the path in which the api file will be created",
			placeholder: "/user",
			validate(value) {
				if (!value.length) return "Path is required";
			},
		}),
	);

	const name = await cancelable(
		p.text({
			message: "Enter the name for the api file (required)",
			validate(value) {
				if (!value.length) return "Name is required";
			},
		}),
	);

	await handleApi(path, name);
};
export const handleApi = async (path?: string, name?: string) => {
	if (!(await isSolidStart())) {
		p.log.error("Cannot run command. Your project doesn't include solid-start");
		return;
	}
	if (!path) {
		await handleAutocompleteApi();
		return;
	}
	await spinnerify({
		startText: "Creating new api file",
		finishText: "Api file created",
		fn: () => createApi(path, name),
	});
};
