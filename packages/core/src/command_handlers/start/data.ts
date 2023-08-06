import { createData } from "../../lib/start/add_data";
import { isSolidStart } from "../../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { spinnerify } from "../../lib/utils/ui";
const handleAutocompleteData = async () => {
  const path = (
    await p.text({ message: "Enter the path in which the data file will be created", placeholder: "/user/login" })
  ).toString();
  const res = (await p.text({
    message: "Enter the name for the data file (leave this blank for the default)",
  })) as string;
  const name = !res ? undefined : res;
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
