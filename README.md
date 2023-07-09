<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=CLI&background=tiles&project=%20" alt="Solid CLI">
</p>

# Solid CLI

A custom CLI built for the purpose of installing and managing SolidJS apps and projets. The goal of the CLI is to provide a usefu and powerful utility to installing any dependencies, searching the Solid ecosystem etc.

# Roadmap/Features

- [ ] Templates
  - [ ] From Degit
- [ ] Docs
- [ ] Primitives
  - [ ] Add/remove/update primitives
  - [ ] Search list of primitives
- [ ] Integrations
  - [ ] Auth.js
  - [ ] Tailwind
  - [ ] PandaCSS
  - [ ] Cypress
  - [ ] PostCSS
  - [ ] Vanilla Extract
  - [ ] Vitest
  - [ ] Tauri
  - [ ] Playwright
- [ ] Utilities
  - [ ] eslint-plugin-solid
  - [ ] solid-devtools
- [ ] Misc
  - [ ] Launch new Stackblitz
  - [ ] Launch new CodeSandBox
- [ ] SolidStart
  - [ ] New route
  - [ ] New data file
  - [ ] Enable Adapters
  - [ ] Enable SSR/CSR/SSG mode
     
# CLI Design

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
- `new`: Opens your browser to a new template via CSB/SB ie. `solid new bare --stackblitz` opens https://solid.new/bare
- `ecosystem`
  - `add`: Starts the process of submitting your current project to our ecosystem listing (Solidex) ie. `solid ecosystem publish`
  - `search`: Initializes an ecosystem search result `solid ecosystem search auth`

# Development Path

We will need to decide what framework and language we will use to develop this utility.

## JS

- [`Solid Ink`](https://github.com/devinxi/solid-ink) - Needs to be maintained but expands our ecosystem
- [`Ink`](https://github.com/vadimdemedes/ink) - React-based and popular
- [`Clack`](https://github.com/natemoo-re/clack) - Used by Astro
- [`Tiny Bin`](https://github.com/fabiospampinato/tiny-bin) - By Fabio!
- [`Prompts`](https://github.com/terkelg/prompts) - Popular and well maintained

## Rust

- [`TUI-RS`](https://github.com/fdehau/tui-rs) - Great for using SWC

## Go

- [`BubbleTea`](https://github.com/charmbracelet/bubbletea) - Beautiful CLI builder lots of tools
- [`Cobra`](https://github.com/spf13/cobra) - Used by K8

# Contributions

Please feel free to contribute to this repo by expanding on this design document. Once we lock a general design a choice of technology will be decided.
