#! /usr/bin/env node
import { handleNew } from "@solid-cli/commands/new";
import { bgCyan, black } from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
intro(`\n${bgCyan(black(` Create-Solid v${version}`))}`);
handleNew();
