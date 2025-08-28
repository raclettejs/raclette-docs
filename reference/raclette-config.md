---
outline: deep
---

# raclette Config

## name

- Type: `string`
- Default: `"raclette-app"`

Title for the application.

## services

- Type: `object`

Configuration of system services used in development and runtime.

### services.client

Frontend development backend.

- `enabled`: `boolean`  
  Whether the client service is enabled.
- `port`: `number`  
  Port the client runs on.
- `name?`: `string` _(optional)_  
  Custom name for the client container.
- `nodeModulesVolume?`: `string` _(optional)_  
  Volume name for sharing `node_modules`.
- `installPackages?`: `string[]` _(optional)_  
  Additional packages to install.
- `volumes?`: `VolumeDefinition[]` _(optional)_  
  Additional volumes to mount.

### services.backend

Backend service configuration.

- `enabled`: `boolean`
- `port`: `number`
- `name?`: `string` _(optional)_
- `nodeModulesVolume?`: `string` _(optional)_
- `enableDebug?`: `boolean` _(optional)_  
  Enables debug mode.
- `installPackages?`: `string[]` _(optional)_
- `volumes?`: `VolumeDefinition[]` _(optional)_

### services.mongodb

MongoDB container configuration.

- `enabled`: `boolean`
- `port`: `number`
- `name?`: `string` _(optional)_
- `volume?`: `string` _(optional)_
- `databaseName?`: `string` _(optional)_
- `volumes?`: `VolumeDefinition[]` _(optional)_

### services.redis

Redis service definition.

- `enabled`: `boolean`
- `port`: `number`
- `name?`: `string` _(optional)_
- `volume?`: `string` _(optional)_
- `db?`: `number` _(optional)_  
  Redis DB index to use.
- `volumes?`: `VolumeDefinition[]` _(optional)_

### services.workbench

workbench container (admin area)

- `enabled`: `boolean`
- `port`: `number`
- `volumes?`: `VolumeDefinition[]` _(optional)_

### services.[custom]

Any additional custom service can be defined here.

## volumes

- Type: `Record<string, VolumeDefinition | null>` _(optional)_

Global volumes for the Docker Compose setup.

## modules

- Type: `Array<string | [string, any]>`
- Default: `[]`

List of Raclette modules to load. You can pass config using `[name, options]`.

## env

- Type: `object`

Environment-specific values injected at runtime.

### env.development

- Type: `Record<string, any>`  
  Environment variables for development mode.

### env.production

- Type: `Record<string, any>`  
  Environment variables for production mode.

### env.[custom]

You may define additional environments.

## global

- Type: `object`

Global configuration for frontend and backend

### global.requireAuthentication

- Type: `boolean` _(optional)_  
  Defines if a login is required.

## frontend

- Type: `object`

Frontend configuration.

### frontend.framework

- Type: `"vue"` | `"react"`  
  Defines the primary frontend framework.

### frontend.vue.plugins?

- Type: `string[]` _(optional)_  
  Vue plugins to register.

### frontend.react.plugins?

- Type: `string[]` _(optional)_  
  React plugins to register.

### frontend.custom?

- Type: `Record<string, any>` _(optional)_  
  Custom frontend options.

## backend

- Type: `object`

Backend configuration.

### backend.sockets

See [SocketConfig](#socketconfig) for full details.

### backend.custom?

- Type: `Record<string, any>` _(optional)_

## typescript

- Type: `object` _(optional)_

TypeScript-specific overrides.

### typescript.compilerOptions?

- Type: `Record<string, any>` _(optional)_  
  Pass-through compiler options.

## eslint

- Type: `object` _(optional)_

ESLint configuration.

### eslint.rules?

- Type: `Record<string, any>` _(optional)_

### eslint.plugins?

- Type: `string[]` _(optional)_

### eslint.extends?

- Type: `string[]` _(optional)_

### eslint.ignores?

- Type: `string[]` _(optional)_

### eslint.useRecommended?

- Type: `boolean` _(optional)_  
  Enable recommended ESLint config.

### eslint.env?

- Type: `Record<string, any>` _(optional)_

## VolumeDefinition

Defines a volume mount between host and container.

- `source`: `string`  
  Named volume or host path.
- `target`: `string`  
  Container path.
- `type?`: `"bind"` | `"volume"` | `"tmpfs"` _(optional)_
- `readonly?`: `boolean` _(optional)_
- `volumeOptions?`: `object` _(optional)_
  - `nocopy?`: `boolean` _(optional)_
- `bindOptions?`: `object` _(optional)_
  - `propagation?`: `string` _(optional)_
  - `createHostPath?`: `boolean` _(optional)_
- `tmpfsOptions?`: `object` _(optional)_
  - `size?`: `number` _(optional)_
  - `mode?`: `number` _(optional)_

## SocketConfig

WebSocket configuration used by the backend.

### sockets.autoSend

Automatically push data when client connects.

- `compositions`: `boolean`
- `interactionLinks`: `boolean`
- `projectConfig`: `boolean`
- `additionalDatatypes`: `Record<string, boolean | undefined>`
- `customData?`: `Record<string, any>` _(optional)_

### sockets.security

WebSocket authentication config.

- `requireAuth`: `boolean`
- `tokenValidation`: `"jwt"`
- `customValidator?`: `string` _(optional)_

### sockets.options

Advanced socket settings.

- `adapter`: `"memory"` | `"redis"` | `"mongodb"`
- `connectionTimeout`: `number`
- `pingInterval`: `number`
- `pingTimeout`: `number`

## Type Declarations

::: details Show Type Declarations

```TypeScript

/**
 * Raclette Configuration with ESLint properties
 */
export interface RacletteConfig {
  name: string
  services: {
    client?: {
      enabled: boolean
      port: number
      name?: string
      nodeModulesVolume?: string
      installPackages?: string[]
      volumes?: VolumeDefinition[] // Add custom volumes property
    }
    backend?: {
      enabled: boolean
      port: number
      name?: string
      nodeModulesVolume?: string
      enableDebug?: boolean
      installPackages?: string[]
      volumes?: VolumeDefinition[] // Add custom volumes property
    }
    mongodb?: {
      enabled: boolean
      port: number
      name?: string
      volume?: string
      databaseName?: string
      volumes?: VolumeDefinition[] // Add custom volumes property
    }
    redis?: {
      enabled: boolean
      port: number
      name?: string
      volume?: string
      db?: number
      volumes?: VolumeDefinition[] // Add custom volumes property
    }
    workbench?: {
      enabled: boolean
      port: number
      volumes?: VolumeDefinition[] // Add custom volumes property
    }
    [key: string]: any
  }
  // Additional global volumes definition for the compose file (top-level named volumes)
  volumes?: Record<string, VolumeDefinition | null>
  modules: Array<string | [string, any]>
  env: {
    development: Record<string, any>
    production: Record<string, any>
    [key: string]: Record<string, any>
  }
  frontend: {
    framework: "vue" | "react"
    vue?: {
      plugins: string[]
    }
    react?: {
      plugins: string[]
    }
    custom?: {
      [key: string]: any
    }
  }
  backend: {
    sockets: SocketConfig
    custom?: {
      [key: string]: any
    }
  }
  typescript?: {
    compilerOptions?: {
      // Allow for any compiler option to be overridden
      [key: string]: any
    }
  }
  eslint?: {
    rules?: Record<string, any>
    plugins?: string[]
    extends?: string[]
    ignores?: string[]
    // Whether to use recommended rules
    useRecommended?: boolean
    // For environment-specific configurations
    env?: Record<string, any>
  }
}

/**
 * Volume Definition for Docker Compose
 */
export interface VolumeDefinition {
  // Source can be a named volume, host path, or volume specification
  source: string
  // Target is the path inside the container
  target: string
  // Optional volume type (bind, volume, tmpfs)
  type?: "bind" | "volume" | "tmpfs"
  // Optional read-only flag
  readonly?: boolean
  // Optional volume driver-specific options
  volumeOptions?: {
    // Populate on service creation when volume doesn't exist
    nocopy?: boolean
    // Any other driver-specific options
    [key: string]: any
  }
  // Optional bind-specific options
  bindOptions?: {
    // Propagation mode for bind mounts
    propagation?:
      | "private"
      | "rprivate"
      | "shared"
      | "rshared"
      | "slave"
      | "rslave"
    // Create host path if it doesn't exist
    createHostPath?: boolean
    // Any other bind-specific options
    [key: string]: any
  }
  // Optional tmpfs-specific options
  tmpfsOptions?: {
    // Size of the tmpfs mount in bytes
    size?: number
    // File mode of the tmpfs in octal
    mode?: number
  }
}

/**
 * Socket Configuration
 */
export type SocketConfig = {
  /** Configure what data is automatically sent when a client joins */
  autoSend: {
    /** Send compositions data on join */
    compositions: boolean
    /** Send interaction links data on join */
    interactionLinks: boolean
    /** Send project configuration on join */
    projectConfig: boolean
    /** Additional custom data types to send (must be in the DB and registered via stream) */
    additionalDatatypes: {
      [key: string]: boolean | undefined
    }
    customData?: {
      /** Key is the property name in the response, value is the static data */
      [key: string]: any
    }
  }

  /** Socket security configuration */
  security: {
    /** Whether authentication is required for socket connections */
    requireAuth: boolean
    /** Token validation method */
    tokenValidation: "jwt"
    /** Custom validation handler path */
    customValidator?: string
  }

  /** Advanced socket options */
  options: {
    /** Socket.io adapter configuration */
    adapter: "memory" | "redis" | "mongodb"
    /** Connection timeout in milliseconds */
    connectionTimeout: number
    /** Ping interval in milliseconds */
    pingInterval: number
    /** Ping timeout in milliseconds */
    pingTimeout: number
  }
}

/**
 * Raclette Module Definition
 */
export interface RacletteModule {
  name: string
  services?: Record<string, any>
  extendConfig?: (config: RacletteConfig, options: any) => RacletteConfig
  backendExtensions?: {
    plugins?: string[]
    routes?: string[]
  }
  clientExtensions?: {
    components?: string[]
    plugins?: string[]
  }
  hooks?: Record<string, (...args: any[]) => Promise<void>>
}

```

:::
