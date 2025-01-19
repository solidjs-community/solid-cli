#! /usr/bin/env node

import { defineCommand, runMain } from "citty";
import { createSolid } from "@solid-cli/create";
import packageJson from "../package.json" with { type: "json" };
import { intro } from "@clack/prompts";
import * as color from "picocolors";
intro(`\n${color.bgCyan(color.black(` Solid CLI v${packageJson.version}`))}`);

const main = defineCommand({
    subCommands: { create: createSolid(packageJson.version) },
});

runMain(main);