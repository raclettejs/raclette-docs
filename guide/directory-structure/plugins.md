# plugins

The plugins directory allows you to extend your Raclette application through modular, encapsulated features. Each plugin can register both frontend and backend behavior, making it easy to build reusable functionality.

A plugin consists of a **client** and **server** part:
-	The **client** defines the API surface available to frontend code, such as routes and widgets.
-	The **server** registers backend routes and logic specific to the plugin.

This structure enables clean separation of concerns while maintaining a coherent development experience.

## Directory Structure

```bash
plugins/
└── [plugin-name]/
    ├── client/
    │   ├── index.ts                # Exports plugin's frontend API
    │   └── ...                     # Optional: your content
    └── server/
        ├── index.ts                # Registers the plugin's server-side behavior
        ├── routes.ts               # Optional: plugin-specific API routes
        └── ...                     # Optional: your content
```

## Client-Side Plugin (`client/index.ts`)

This file defines the frontend-facing interface of the plugin. You can expose API methods or utilities that are made available via the Plugin API in your application code. Additionally, this is where you declare which UI components (widgets) the plugin contributes to the system.

## Server-Side Plugin (`server/index.ts`)

This file is used to register server-side logic for the plugin, such as adding custom routes or middleware. If your plugin has API endpoints, these can be implemented in `routes.ts` and imported here.

---

Plugins in Raclette are designed to be self-contained, making them easy to share, reuse, or disable. They integrate deeply into both client and server layers of the application and are ideal for building domain-specific modules.

::: tip

Plugins are automatically discovered based on the directory structure. There’s no need to register them manually.

:::

::: info

Learn more about plugins in the [plugins documentation](/guide/plugins.md).

:::