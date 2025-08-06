# Plugin Client API

The client-side configuration of a Raclette plugin is defined in the `index.ts` file of your plugin. This file defines the frontend functionality, components, and behavior of your plugin.

## Basic Usage

```typescript
import { defineRaclettePluginClient } from "@raclettejs/raclette-core/client"

export default defineRaclettePluginClient({
  install: async ($installApi, $corePluginApi) => {
    // Plugin initialization logic
  },
  i18n: {
    // Internationalization strings
  },
  data: {
    // Data definitions
  },
  exportComponents: {
    // Exported components
  },
})
```

## Configuration Options

### `install`

The install function is called when the plugin is initialized. It receives two parameters that provide access to the Raclette installation and plugin APIs.

```typescript
install: ($installApi: InstallApi, $corePluginApi: CorePluginApi) =>
  Promise<unknown> | unknown
```

**Parameters:**

**`$installApi`** provides access to core installation functionality:

- `addDataType`: Register new data types
- `addNodeDependency`: Add node dependencies
- `addStoreEffect`: Add store effects
- `dispatchStore`: Dispatch store actions

**`$pluginApi`** provides access to plugin-specific APIs:

- `$eventbus`: Plugin-scoped event bus
- `$globalEventbus`: Global event bus
- `$store`: Plugin store API
- `$log`: Plugin logging functionality
- `$file`: File operations
- `$data`: Plugin data methods
- `error`: Error handling
- `$socket`: Socket connections
- `$i18n`: Internationalization helper

**Example:**

```typescript
install: async ($installApi, $corePluginApi) => {
  // Add a custom data type
  $installApi.addDataType("customType", customTypeDefinition)

  // Use plugin store
  $corePluginApi.$store.dispatch("initializePlugin")

  // Setup logging
  $corePluginApi.$log.info("Plugin initialized successfully")

  // the returned object will be appended to the $corePluginApi and be available in your component
  return {
    myCustomApiEndpoint:([...])=>[...]
  }
}
```

### `i18n`

Internationalization strings for your plugin. Organize translations by locale, then by key.

```typescript
i18n: {
  [locale: string]: {
    [key: string]: string
  }
}
```

**Example:**

```typescript
i18n: {
  en: {
    weather:{
      title: 'Weather',
      loading: 'Loading weather data...',
      error: 'Failed to load weather data',
    },
    settings:{
      location: 'Location',
      units: 'Units'
    }
  },
  fr: {
    weather:{
      title: 'Météo',
      loading: 'Chargement des données météo...',
      error: 'Échec du chargement des données météo',
    },
    settings:{
      location: 'Emplacement',
      units: 'Unités'
    }
  }
}
```

### `data`

Define data structures and their operations that your plugin will use. Each data definition specifies the type and available CRUD operations.

```typescript
data: {
  [key: string]: PluginClientDataDefinition
}
```

Each data definition includes:

- `type`: The data type identifier
- `operations`: Available operations (create, update, delete, etc.)

**Example:**

```typescript
data: {
  weatherData: {
    type: 'weather',
    operations: {
      get: {
        target: (payload) => `/api/weather/${payload.location}`,
        method: 'GET'
      },
      create: {
        target: '/api/weather',
        method: 'POST',
        broadcast: true
      },
      update: {
        target: (payload) => `/api/weather/${payload.id}`,
        method: 'PUT'
      },
      delete: {
        target: (payload) => `/api/weather/${payload.id}`,
        method: 'DELETE'
      }
    },
    offlineMode: true
  },
  userPreferences: {
    type: 'preferences',
    operations: {
      update: {
        target: '/api/user/preferences',
        method: 'PATCH'
      }
    }
  }
}
```

### `exportComponents`

Export Vue components that can be used by other plugins or the main application.

```typescript
exportComponents: {
  [key: string]: DefineComponent
}
```

**Example:**

```typescript
import WeatherCard from "./components/WeatherCard.vue"
import TemperatureDisplay from "./components/TemperatureDisplay.vue"

export default defineRaclettePluginClient({
  exportComponents: {
    WeatherCard: WeatherCard,
    TemperatureDisplay: TemperatureDisplay,
  },
})
```

## Complete Example

Here's a comprehensive example of a weather plugin:

```typescript
import { defineRaclettePluginClient } from "@raclettejs/raclette-core/client"
import WeatherWidget from "./components/WeatherWidget.vue"
import WeatherCard from "./components/WeatherCard.vue"

export default defineRaclettePluginClient({
  install: async ($installApi, $pluginApi) => {
    // Initialize weather service
    $pluginApi.$log.info("Initializing weather plugin")

    // Add weather data type
    $installApi.addDataType("weather", {
      schema: {
        temperature: "number",
        humidity: "number",
        location: "string",
      },
    })

    // Setup error handling
    $pluginApi.$eventbus.on("weather:error", (error) => {
      $pluginApi.$log.error("Weather error:", error)
    })
  },
  i18n: {
    en: {
      "weather.current": "Current Weather",
      "weather.forecast": "Forecast",
      "weather.temperature": "Temperature",
      "weather.humidity": "Humidity",
      "weather.loading": "Loading weather data...",
    },
    fr: {
      "weather.current": "Météo Actuelle",
      "weather.forecast": "Prévisions",
      "weather.temperature": "Température",
      "weather.humidity": "Humidité",
      "weather.loading": "Chargement des données météo...",
    },
  },

  data: {
    weatherData: {
      type: "weather",
      operations: {
        get: {
          target: (payload) => `/api/weather/${payload.location}`,
          method: "GET",
        },
        getAll: {
          target: "/api/weather/locations",
          method: "GET",
        },
        create: {
          target: "/api/weather/locations",
          method: "POST",
        },
        update: {
          target: (payload) => `/api/weather/locations/${payload.locationId}`,
          method: "PUT",
          broadcast: true,
          channels: [
            {
              channel: "weather-updates",
              channelKey: "locationId",
              prefix: "weather",
            },
          ],
        },
        delete: {
          target: (payload) => `/api/weather/locations/${payload.locationId}`,
          method: "DELETE",
        },
      },
      offlineMode: true,
    },
  },

  exportComponents: {
    WeatherCard: WeatherCard,
    WeatherIcon: () => import("./components/WeatherIcon.vue"),
  },
})
```

## Accessing and writing Plugin Data

Within your plugin components, you can access the defined data through the `usePluginApi()` composable:

```typescript
const { $data } = usePluginApi()

// Get weather data for a specific location
const {
  data: weatherData,
  query: weatherQuery,
  execute,
  isLoading,
  error,
} = $data.weatherData.get({
  params: { location: "Paris" },
  options: { immediate: true },
})

// Get all weather locations
const {
  data: allLocations,
  query: locationsQuery,
  execute: executeGetAll,
} = $data.weatherData.getAll({
  options: { immediate: true },
})
const { execute: createData } = $data.weatherData.create({
  options: {
    cb: executeGetAll,
  },
})
await execute({ _id: "myId" })
await createData({ _id: "newId", location: "Berlin" })
```
