# Basic Commands

### `Add`

```sh
solid add
```

Used to add packages and setup integrations.

::: info
By default, when no arguments or flags are passed, this command will open up a searchable multiselect for you to be able to search through
all supported integrations and packages. You can select the ones you want to use through there.
:::

**Options**

| Option          | Description                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `<integration>` | List of integrations you want to add to your project (ie. unocss, vitepwa, solid-devtools)             |
| `--force`       | Force apply any changes to the config to add the integration(s) even if they already exist `(boolean)` |

---

### `New`

```sh
solid new
```

Creates a new solid project with the selected variation and name.

This can also be used to spin up a new stackblitz or codesandbox instance.

**Options**

| Option                     | Description                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `<variation>`              | The variation you want to start the project from. One of the following: "bare", "js", "ts". |
| `<name>`                   | The name of the project and the folder to create it in.                                     |
| `--stackblitz (short: -s)` | Create the project with the variation in a stackblitz instance. `(boolean)`                 |
