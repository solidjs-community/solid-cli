#! /usr/bin/env node
import { handleNew } from "@solid-cli/commands/new";
import color from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
intro(`\n${color.bgCyan(color.black(` Create-Solid v${version}`))}`);
handleNew();
