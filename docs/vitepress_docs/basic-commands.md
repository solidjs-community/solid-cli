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

---

### `Docs`

```sh
solid docs
```

Searches for a given keyword within the main solid documentation sites

**Options**

| Option      | Description                                    |
| ----------- | ---------------------------------------------- |
| `<keyword>` | The keyword to search within the docs websites |

---

### `Set`

```sh
solid set
```

Sets a specified config parameter to a specified value

**Options**

| Option    | Description                      |
| --------- | -------------------------------- |
| `<key>`   | The key within the config to set |
| `<value>` | The value to set that key to     |

---

### `Playground`

```sh
solid playground
```

Attempts to open the [Solid Playground](https://playground.solidjs.com) in the browser
