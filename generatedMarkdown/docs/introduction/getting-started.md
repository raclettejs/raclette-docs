# Getting Started

## Installation

### Prerequisites

- Node.js
- yarn & npm
- Docker/ Docker-Desktop
- Terminal
- Code Editor (OSS code / VsCode is recommended)

### create-raclette-app

With our CLI tool [create-raclette-app](https://www.npmjs.com/package/create-raclette-app) you can easily set up your initial raclette project.
::: code-group

```sh [npm]
npx create-raclette-app
```

```sh [yarn]
yarn create raclette-app
```

---

You can also manually create everything you need. The most crucial package is `@raclettejs/core` and highly recommended the `@raclettejs/workbench`

::: code-group

```sh [yarn]
yarn add @raclettejs/core @raclettejs/workbench
```

## The Config File

The config file (`raclette.config.js`) allows you to setup your raclette application:

::: code-group

```js [raclette.config.js]
import { defineRacletteConfig } from "@raclettejs/core"

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

## package.json

To integrate raclette into your development workflow, add the following entries to the `scripts` section of your project’s `package.json`:

```json
"scripts": {
  "dev": "raclette dev",
  "down": "raclette down",
  "update": "raclette update",
  "restart": "raclette restart",
  "add-package": "raclette add-package"
},
```

This setup allows you to interact with the raclette CLI using familiar `yarn` commands. For example, you can start your development backend with:

```bash
yarn dev
```

Or shut down all services with:

```bash
yarn down
```

For a complete list of available commands, refer to the [CLI documentation](/docs/introduction/cli-commands.md), and see the [directory-structure/package.json](/docs/directory-structure/package.md) documentation for an overview of the recommended `package.json` setup.

## Local URLs

Once your development environment is running, raclette exposes the following URLs:

- **Frontend Application** → [http://localhost:8081](http://localhost:8081) 
  The rendered UI powered by your selected frontend framework (e.g. Vue or React).

- **raclette Workbench** → [http://localhost:8083](http://localhost:8083) 
  The visual configuration interface for managing views, users, permissions, and more.

You can access both in your browser while raclette is running.

## Best Practices

### Directory Structure

Follow the recommended directory structure:

- Place frontend-specific files in `services/frontend`
- Place backend-specific files in `services/backend`
- Place shared code in `services/backend/src/shared`
- Use the `plugins` directory for reusable components

### Docker Usage

- Use direct mode (`yarn dev -d`) for faster development iterations
- For full Docker integration, omit the `-d` flag
- Filter logs to focus on relevant services with `--filter`

### Configuration

- Keep all configuration in `raclette.config.js`
- Use environment variables for sensitive information
- Create `.env` files for development and `.env.production` for production

<!--
### Module Development

When creating raclette modules:

- Follow the `RacletteModule` interface
- Use the `extendConfig` hook to modify the config
- Provide clear documentation for module options
- Test modules in isolation before integration
-->

### Performance Considerations

- Use the virtual file system judiciously to avoid overhead
- Prefer direct mode for development when possible
- Consider using separate Docker volumes for node_modules to speed up builds
