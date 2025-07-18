# `raclette.config.js`

The `raclette.config.js` file is the main configuration file for your Raclette project. It allows you to customize and configure various aspects of the framework, from frontend settings to backend services and environment-specific variables.

This configuration file is automatically loaded by Raclette when your application starts, and it provides a centralized place to adjust the project's behavior to fit your specific needs.

## Example

A basic, empty configuration file for Raclette might look like this:

```js
import { defineRacletteConfig } from "@raclettejs/raclette-core"

export default defineRacletteConfig({
  // Your Raclette configuration goes here
})
```

You can add various configuration properties to this file to control aspects like:
- Frontend framework (e.g., Vue, React)
- Backend services (e.g., server, database, caching)
- Custom environment variables
- ESLint and TypeScript settings
- And more…

::: info

Discover all the available options in the [raclette configuration documentation](/reference/raclette-config.md).

:::