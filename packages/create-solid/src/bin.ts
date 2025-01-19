#! /usr/bin/env node

import { runMain } from "citty";
import { main } from ".";
import { intro } from "@clack/prompts";
import color from "picocolors";
import packageJson from "../package.json" with { type: "json" };

intro(`\n${color.bgCyan(color.black(` Create-Solid v${packageJson.version}`))}`);

runMain(main(packageJson.version));