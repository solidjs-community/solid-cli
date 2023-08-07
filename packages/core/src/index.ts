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

import { setLocale, t } from "./translations";
import { version } from "../package.json";
import { configInst } from "../config";

const possibleActions = [
  { value: "add", label: t.ACTION_ADD, hint: "solid add ..." },
  { value: "new", label: t.ACTION_NEW, hint: "solid new ..." },
  { value: "start", label: t.ACTION_START, hint: "solid start ..." },
] as const;

export const provideStartSuggestions = async () => {
  let startAction = await p.select({
    message: t.SELECT_START_ACTION,
    options: [
      { value: "mode", label: t.START_MODE, hint: t.START_MODE_HINT },
      { value: "route", label: t.START_ROUTE, hint: t.START_ROUTE_HINT },
      { value: "data", label: t.START_DATA, hint: t.START_DATA_HINT },
      {
        value: "adapter",
        label: t.START_ADAPTER,
        hint: t.START_ADAPTER_HINT,
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
    message: t.ACTION_START,
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
    version: version,
  });
  await configInst.parseConfig();
  setLocale(configInst.field("lang"));
  p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await provideSuggestions();
    return;
  }

  if (args.length === 1 && args[0] === "start") {
    await provideStartSuggestions();
    return;
  }

  run(cli, args);
};
main();
