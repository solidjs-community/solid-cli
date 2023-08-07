import { createData } from "../../lib/start/add_data";
import { isSolidStart } from "../../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { spinnerify } from "../../lib/utils/ui";
import { cancelable } from "@solid-cli/ui";

const handleAutocompleteData = async () => {
	const path = await cancelable(
		p.text({
			message: "Enter the path in which the data file will be created",
			placeholder: "/user/login",
			validate(value) {
				if (!value.length) return "Path is required";
			},
		}),
	);

	const name = await cancelable(
		p.text({
			message: "Enter the name for the data file (leave this blank for the default)",
			validate(value) {
				if (!value.length) return "Name is required";
			},
		}),
	);

	await handleData(path, name);
};

export const handleData = async (path?: string, name?: string) => {
	if (!(await isSolidStart())) {
		p.log.error("Cannot run command. Your project doesn't include solid-start");
		return;
	}
	if (!path) {
		await handleAutocompleteData();
		return;
	}
	await spinnerify({
		startText: "Creating new data file",
		finishText: "Data file created",
		fn: () => createData(path, name),
	});
};
