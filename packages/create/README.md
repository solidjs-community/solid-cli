# @solid-cli/create

A library for easily initialising Solid projects

## Usage

### Initialising a Vanilla project

```ts
import { createVanilla } from "@solid-cli/create";
createVanilla({ template: "ts", destination: "./ts" });
```

### Initialising a Start project

```ts
import { createStart } from "@solid-cli/create";
createStart({ template: "basic", destination: "./basic" });
```

### Initialising a Library project

```ts
import { createLibrary } from "@solid-cli/create";
createLibrary({ destination: "./library-project" });
```
