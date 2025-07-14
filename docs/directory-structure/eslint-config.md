# ESLint Configuration (`eslint.config.mjs`)

Raclette comes with a built-in ESLint setup designed to provide sensible defaults for modern fullstack development. This configuration uses ESLint's new [flat config system](https://eslint.org/docs/latest/use/configure/configuration-files-new), and is fully integrated with Raclette's project structure.

## Getting Started

To activate Raclette's ESLint configuration, create an `eslint.config.mjs` file in the root of your project:

```js
// eslint.config.mjs
import { withRaclette } from "./.raclette/eslint.config.mjs"

export default withRaclette({
  // Custom rules or overrides
  rules: {
    "no-console": "off",
  },
})
```

This setup wraps your custom configuration into Raclette’s default ESLint base, enabling a powerful and extendable linting system.

## Required Dependencies

Before using the ESLint configuration, install the required dependencies:

```bash
yarn add -D @eslint/js eslint eslint-config-prettier eslint-plugin-import eslint-plugin-prefer-arrow-functions eslint-plugin-prettier eslint-plugin-vue globals prettier typescript-eslint vue-eslint-parser
```

These dependencies ensure support for modern linting patterns, Prettier integration, and framework-specific rules (Vue/React).

## Editor Integration

If you’re using **Visual Studio Code**, enable flat config support in your workspace by adding the following to `.vscode/settings.json`:

```json
{
  "eslint.experimental.useFlatConfig": true
}
```

This is required for the ESLint extension to properly interpret your `eslint.config.mjs` file.

## Customizing Rules

You can apply your own linting rules in two ways:

1. In `eslint.config.mjs`

```js
import { withRaclette } from "./.raclette/eslint.config.mjs"

export default withRaclette({
  rules: {
    indent: ["error", 4],
    quotes: ["error", "single"],
  },
})
```

2. In [`raclette.config.js`](/docs/directory-structure/raclette-config.md)

```js
export default {
  eslint: {
    useRecommended: true, // Set to false to disable Raclette defaults
    rules: {
      indent: ["error", 4],
      quotes: ["error", "single"],
    },
    ignores: ["legacy/**"],
  },
}
```

Both methods allow flexible override of base rules depending on your workflow.

::: warning

- The ESLint configuration is auto-generated and located in the .raclette directory.
- This directory should **not be edited manually**, as changes will be overwritten during builds.

:::
