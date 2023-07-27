#! /usr/bin/env node
import { run, subcommands } from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import commands from "./plugins/plugins_entry";
import { handleAdd } from "./command_handlers/add";
import { handleNew } from "./command_handlers/new";
import { handleMode } from "./command_handlers/start/mode";
import { handleAdapter } from "./command_handlers/start/adapter";
import { handleData } from "./command_handlers/start/data";
import { handleRoute } from "./command_handlers/start/route";
const possibleActions = [
  { value: "add", label: "Add an integration", hint: "solid add ..." },
  { value: "new", label: "Create new project", hint: "solid new ..." },
  { value: "start", label: "A start specific action", hint: "solid start ..." },
] as const;
const provideStartSuggestions = async () => {
  let startAction = await p.select({
    message: "Select a start action",
    options: [
      { value: "mode", label: "Mode", hint: "Changes the mode of the solid app (SSR, CSR, SSG)" },
      { value: "route", label: "Route", hint: "Allows you to create a new file system route" },
      { value: "data", label: "Data File", hint: "Allows you to create a new data file within a route" },
      {
        value: "adapter",
        label: "Adapter",
        hint: "Allows for setting and updating the adapter used to build a start app",
      },
    ],
  });
  switch (startAction) {
    case "mode":
      await handleMode();
      break;
    case "route":
      await handleRoute();
      break;
    case "data":
      await handleData();
      break;
    case "adapter":
      await handleAdapter();
      break;
  }
};
const provideSuggestions = async () => {
  type ActionType = (typeof possibleActions)[number]["value"];
  let action = (await p.select({
    message: "Select an action",
    // This thing really doesn't like `as const` things
    options: possibleActions as any,
  })) as ActionType;
  if (!action) return;
  switch (action) {
    case "add":
      await handleAdd();
      break;
    case "new":
      await handleNew();
      break;
    case "start":
      await provideStartSuggestions();
      break;
  }
};
const main = async () => {
  const cli = subcommands({
    name: "solid",
    cmds: commands,
  });
  p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
  const args = process.argv.slice(2);
  if (args.length === 0) {
    await provideSuggestions();
    return;
  }
  run(cli, args);
};
main();
