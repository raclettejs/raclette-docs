# Getting Started

## Installation

### Prerequisites

- Node.js
- yarn
- Docker
- Terminal
- Code Editor (VSCode is recommended)

::: code-group

```sh [yarn]
yarn add -D @raclettejs/raclette-core
```

:::

## The Config File

The config file (`raclette.config.js`) allows you to setup your raclette application:

::: code-group

```js [raclette.config.js]
import { defineRacletteConfig } from "@raclettejs/raclette-core"

export default defineRacletteConfig({
  name: "raclette-dev",

  // Frontend framework configuration
  frontend: {
    framework: "vue",
    vue: {
      plugins: ["vue-router"],
    },
  },
})
```

:::

See [Reference: raclette Config](../reference/raclette-config) for more.

## package.json

To integrate Raclette into your development workflow, add the following entries to the `scripts` section of your project’s `package.json`:

```json
"scripts": {
  "dev": "raclette dev",
  "down": "raclette down",
  "update": "raclette update",
  "restart": "raclette restart",
  "add-package": "raclette add"
},
```

This setup allows you to interact with the Raclette CLI using familiar `yarn` commands. For example, you can start your development server with:

```bash
yarn dev
```

Or shut down all services with:

```bash
yarn down
```

For a complete list of available commands, refer to the [CLI documentation](/guide/introduction/cli-commands.md), and see the [directory-structure/package.json](/guide/directory-structure/package.md) documentation for an overview of the recommended `package.json` setup.
