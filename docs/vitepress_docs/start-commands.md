# SolidStart Commands

### `Mode`

```sh
solid start mode
```

Set the rendering mode for solid to build for and use (ie. Client-Side Rendering (CSR), Server-Side Rendering (SSR), Static-Site Generation (SSG))

**Options**

| Option   | Description                                                    |
| -------- | -------------------------------------------------------------- |
| `<mode>` | The rendering mode to use. One of the following: csr, ssr, ssg |

---

### `Route`

```sh
solid start route
```

Creates a new route file in the file routes directory.

**Options**

| Option   | Description                                 |
| -------- | ------------------------------------------- |
| `<path>` | The path to the new route                   |
| `<name>` | The name of the `.tsx` file to be generated |

---

### `Adapter`

```sh
solid start adapter
```

Used to setup a SolidStart specific adapter.

**Options**

| Option    | Description                      |
| --------- | -------------------------------- |
| `<name>`  | The name of the adapter `string` |
| `--force` | Force setup the adapater         |

### `Data`

```sh
solid start data
```

Creates a new data file at the given path

**Options**

| Option   | Description                                     |
| -------- | ----------------------------------------------- |
| `<path>` | The path to the new data file                   |
| `<name>` | The name of the `.data.ts` file to be generated |
