---
outline: deep
---

# Plugin Metadata (`raclette.plugin.js`)

The `raclette.plugin.js` file is the main configuration file for your Raclette plugin. It defines the plugin's metadata, entry points, and core configuration settings.

## Basic Structure

```javascript
export default {
  name: "my-plugin",
  author: "Your Name",
  version: "1.0.0",
  description: "Description of your plugin",
  clientDir: "./client",
  serverDir: "./server"
}
```

## Configuration Options

### Required Fields

#### `name`
The unique identifier for your plugin.

```javascript
name: "canvas"
```

#### `author`
The plugin author's name or organization.

```javascript
author: "pacifico"
```

#### `version`
The plugin version following semantic versioning (semver).

```javascript
version: "0.0.1"
```

### Optional Fields

#### `description`
A brief description of what your plugin does.

```javascript
description: "A plugin PoC for a miro-like canvas."
```

#### `repository`
URL to the plugin's source code repository.

```javascript
repository: "https://github.com/user/my-plugin"
```

#### `license`
The plugin's license (e.g., MIT, Apache-2.0, GPL-3.0).

```javascript
license: "MIT"
```

#### `clientDir`
Path to the client-side code directory (relative to the plugin root).

```javascript
clientDir: "./client"
```

#### `serverDir`
Path to the server-side code directory (relative to the plugin root).

```javascript
serverDir: "./server"
```

#### `dependencies`
Array of plugin dependencies that must be installed before this plugin.

```javascript
dependencies: ["core-ui", "data-manager"]
```

#### `options`
Plugin-specific configuration options.

```javascript
options: {
  theme: "dark",
  maxConnections: 100,
  enableCache: true
}
```

### Lifecycle Hooks

You can define hooks that run at different stages of the plugin lifecycle:

#### `beforeMount`
Called before the plugin is mounted to the application.

```javascript
hooks: {
  beforeMount: async (app) => {
    console.log('Plugin is about to be mounted')
    // Perform pre-mount setup
  }
}
```

#### `mounted`
Called after the plugin has been successfully mounted.

```javascript
hooks: {
  mounted: async (app) => {
    console.log('Plugin has been mounted')
    // Perform post-mount initialization
  }
}
```

#### `beforeUnmount`
Called before the plugin is unmounted from the application.

```javascript
hooks: {
  beforeUnmount: async (app) => {
    console.log('Plugin is about to be unmounted')
    // Perform cleanup tasks
  }
}
```

## Complete Example

Here's a comprehensive example of a `raclette.plugin.js` file:

```javascript
export default {
  name: "advanced-canvas",
  author: "Canvas Team",
  version: "1.2.0",
  description: "Advanced canvas plugin with collaborative features and real-time synchronization",
  repository: "https://github.com/canvas-team/advanced-canvas",
  license: "MIT",
  
  // Entry points
  clientDir: "./client",
  serverDir: "./server",
  
  // Plugin dependencies
  dependencies: [
    "websocket-manager",
    "user-authentication"
  ],
  
  // Plugin configuration
  options: {
    maxCanvasSize: { width: 5000, height: 5000 },
    enableRealTimeSync: true,
    defaultZoomLevel: 1.0,
    supportedFormats: ["png", "jpg", "svg"],
    collaboration: {
      maxUsers: 50,
      cursorsVisible: true,
      enableChat: true
    }
  },
  
  // Lifecycle hooks
  hooks: {
    beforeMount: async (app) => {
      console.log('Setting up canvas environment...')
      
      // Initialize canvas utilities
      await initializeCanvasUtils()
      
      // Setup global styles
      injectCanvasStyles()
    },
    
    mounted: async (app) => {
      console.log('Canvas plugin mounted successfully')
      
      // Register global canvas components
      app.component('GlobalCanvas', CanvasComponent)
      
      // Start background services
      startCanvasServices()
    },
    
    beforeUnmount: async (app) => {
      console.log('Cleaning up canvas resources...')
      
      // Stop background services
      stopCanvasServices()
      
      // Clear canvas cache
      clearCanvasCache()
    }
  }
}
```

## Plugin Directory Structure

Based on the `clientDir` and `serverDir` configuration, your plugin should follow this structure:

```
my-plugin/
├── raclette.plugin.js      # Main plugin configuration
├── client/                 # Client-side code (if clientDir specified)
│   ├── index.ts           # Client entry point
│   ├── components/        # Vue components
│   └── widgets/           # Plugin widgets
├── server/                # Server-side code (if serverDir specified)
│   ├── index.ts          # Server entry point
│   ├── routes/           # API routes
│   └── services/         # Business logic
└── README.md             # Plugin documentation
```

## Best Practices

1. **Semantic Versioning**: Always use semantic versioning for your plugin versions
2. **Clear Descriptions**: Write descriptive and concise descriptions
3. **Proper Dependencies**: Only list essential plugin dependencies
4. **Lifecycle Management**: Use hooks for proper setup and cleanup
5. **Configuration Options**: Provide sensible defaults in the options object
6. **Documentation**: Include repository links and proper licensing information

## Validation

The Raclette framework will validate your plugin metadata on load. Ensure:

- `name` is unique across installed plugins
- `version` follows semantic versioning format
- `dependencies` reference existing, available plugins
- Directory paths in `clientDir` and `serverDir` exist and contain valid entry points
- Hook functions are properly async if they perform asynchronous operations