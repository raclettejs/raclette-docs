# `packages.json`

The `packages.json` file serves a similar purpose to the standard `package.json`, but is specifically designed for Raclette-based applications. It allows you to define Node.js dependencies that should be installed and available within the Raclette environment.

This file is structured to separate dependencies for both the **client** and the **server** layers of your application. Each section supports both `dependencies` and `devDependencies`, following the standard npm format.

This setup enables more fine-grained control over what packages are included in which runtime context, and helps keep the client and server environments clean and purpose-driven.

::: code-group

```json [packages.json]
{
  "client": {
    "dependencies": {
      // client-side dependencies here
    },
    "devDependencies": {
      // client-side dev dependencies here
    }
  },
  "server": {
    "dependencies": {
      // server-side dependencies here
    },
    "devDependencies": {
      // server-side dev dependencies here
    }
  }
}
```

::: info

Note: These dependencies are handled automatically by Raclette during the build process and are injected into the appropriate environments. You do not need to manage separate node_modules folders manually.

:::