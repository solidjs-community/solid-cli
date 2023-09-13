<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=CLI&background=tiles&project=%20" alt="Solid CLI">
</p>

> [!WARNING]
> This project is under heavy development and is not yet complete. More features coming soon!

# Solid CLI

[![Build and Test](https://github.com/solidjs-community/solid-cli/actions/workflows/tests.yml/badge.svg)](https://github.com/solidjs-community/solid-cli/actions/workflows/tests.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/5233ac74-3f53-4c90-b95d-25b528b931a1/deploy-status)](https://app.netlify.com/sites/solid-cli/deploys)

A custom-built CLI for creating and managing SolidJS apps and projects.

## Roadmap/Features

- [x] Templates
  - [x] From Degit
- [x] Docs
- [ ] Primitives
  - [ ] Add/remove/update primitives
  - [x] Search list of primitives
- [ ] Integrations
  - [ ] Auth.js
  - [x] Tailwind
  - [ ] PandaCSS
  - [ ] Cypress
  - [ ] PostCSS
  - [x] UnoCSS
  - [ ] Vanilla Extract
  - [ ] Vitest
  - [ ] Tauri
  - [ ] Playwright
- [ ] Utilities
  - [ ] eslint-plugin-solid
  - [x] solid-devtools
- [ ] Misc
  - [x] Launch new Stackblitz
  - [ ] Launch new CodeSandBox
- [x] SolidStart
  - [x] New route
  - [x] New data file
  - [x] Enable Adapters
  - [x] Enable SSR/CSR/SSG mode

## Structure

The CLI will use `solid` as the initialiation keyword. The CLI commands will then cascade based on groupings determined baed on what the action does defined by higher level actions. The actions will be:

- `version`: Displays a changelog of recent Solid versions
  - `start`: Specific command for Start versions
- `docs`: List a `man`-like page for versioned docs or link out to the docs
- `primitives`: Potential integration with Solid Primitives
- `add`, `remove`: Used for adding and installing integrations/packages ie. `solid add tailwind`
- `config`: For enabling a certain features ie. `solid config vite _____`
- `start`: Special keyword for SolidStart commands
  - `mode`: Changes the Start serving mode (ssr/csr/ssg) `solid mode ssr`
  - `route`: Creates a new route ie. `solid start route login`
- `new`: Opens your browser to a new template via CSB/SB ie. `solid new bare --stackblitz` opens <https://solid.new/bare>
- `ecosystem`
  - `add`: Starts the process of submitting your current project to our ecosystem listing (Solidex) ie. `solid ecosystem publish`
  - `search`: Initializes an ecosystem search result `solid ecosystem search auth`

## Contributing

Please feel free to contribute to this repo by expanding on this design document. Once we lock a general design a choice of technology will be decided.
