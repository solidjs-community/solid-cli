#! /usr/bin/env node
import { run, subcommands } from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import commands from "./plugins/plugins_entry";
import { handleAdd } from "./command_handlers/add";
import { handleNew } from "./command_handlers/new";
const possibleActions = [
  { value: "add", label: "Add an integration", hint: "solid add ..." },
  { value: "new", label: "Create new project", hint: "solid new ..." },
  { value: "start", label: "A start specific action", hint: "solid start ..." },
] as const;
const provideSuggestions = async () => {
  type ActionType = (typeof possibleActions)[number]["value"];
  let action = (await p.select({
    message: "What would you like to do?",
    // This thing really doesn't like `as const` things
    options: possibleActions as any,
  })) as ActionType;
  if (!action) return;
  switch (action) {
    case "add":
      await handleAdd(undefined, false);
      break;
    case "new":
      await handleNew();
      break;
    case "start":
      // Launch start autocomplete
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
  if (args.length === 0) await provideSuggestions();
  run(cli, args);
};
main();
