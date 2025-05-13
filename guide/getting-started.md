# Getting Started

## Installation

### Prerequisites

- Node.js
- Terminal
- Code Editor (VSCode is recommended)

::: code-group

```sh [yarn]
yarn add -D @raclettejs/raclette-core
```

```sh [npm]
npm add -D @raclettejs/raclette-core
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