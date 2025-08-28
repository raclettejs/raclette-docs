# `packages.json`

The `packages.json` file serves a similar purpose to the standard `package.json`, but is specifically designed for raclette-based applications. It allows you to define Node.js dependencies that should be installed and available within the raclette environment.

This file is structured to separate dependencies for both the **frontend** and the **backend** layers of your application. Each section supports both `dependencies` and `devDependencies`, following the standard npm format.

This setup enables more fine-grained control over what packages are included in which runtime context, and helps keep the frontend and backend environments clean and purpose-driven.

::: code-group

```json [packages.json]
{
  "frontend": {
    "dependencies": {
      // frontend-side dependencies here
    },
    "devDependencies": {
      // frontend-side dev dependencies here
    }
  },
  "backend": {
    "dependencies": {
      // backend-side dependencies here
    },
    "devDependencies": {
      // backend-side dev dependencies here
    }
  }
}
```

::: info

Note: These dependencies are handled automatically by raclette during the build process and are injected into the appropriate environments. You do not need to manage separate node_modules folders manually.

:::
