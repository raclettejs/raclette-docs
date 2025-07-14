# Getting Started

## Installation

### Prerequisites

- Node.js
- yarn & npm
- Docker
- Terminal
- Code Editor (VSCode is recommended)

### create-raclette-app

With our CLI tool [create-raclette-app](https://www.npmjs.com/package/create-raclette-app) you can easily set up your initial raclette project.

::: code-group

```sh [npm]
npx create-raclette-app
```

The wizard will guide you along and will create all needed files and folders for you. Following the "next steps" from the wizard.

> ⚠️ **PLEASE NOTE**
>
> raclette is currently not live yet. For installation you will need a specific token. [Contact us](https://pacifico.cloud) and we will invite you to our test group. We are happy about everyone interested in raclette.

---

You can also manually create everything you need. The most crucial package is `@raclettejs/raclette-core` and highly recommended the `@raclettejs/raclette-workbench`

::: code-group

```sh [yarn]
yarn add @raclettejs/raclette-core @raclettejs/raclette-workbench
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

See [Reference: raclette Config](/reference/raclette-config.md) for more.

## package.json

To integrate Raclette into your development workflow, add the following entries to the `scripts` section of your project’s `package.json`:

```json
"scripts": {
  "dev": "raclette dev",
  "down": "raclette down",
  "update": "raclette update",
  "restart": "raclette restart",
  "add-package": "raclette add-package"
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

For a complete list of available commands, refer to the [CLI documentation](/docs/introduction/cli-commands.md), and see the [directory-structure/package.json](/docs/directory-structure/package.md) documentation for an overview of the recommended `package.json` setup.

## Local URLs

Once your development environment is running, Raclette exposes the following URLs:

- **Frontend Application** → [http://localhost:8081](http://localhost:8081)  
  The rendered UI powered by your selected frontend framework (e.g. Vue or React).

- **raclette Workbench** → [http://localhost:8083](http://localhost:8083)  
  The visual configuration interface for managing views, users, permissions, and more.

You can access both in your browser while Raclette is running.
