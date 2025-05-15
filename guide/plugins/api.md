# Plugin API

Raclette plugins expose a flexible and type-safe API to interact with backend routes from within frontend components. This is achieved via the `usePluginApi()` composable, which provides two main access points:

- `$data` – for fetching data from defined API endpoints
- `$store` – for sending data (create, update, delete)

## Defining the Plugin API

Each plugin defines its client-side API in the file:

Here, you can register which routes should be available to the frontend using a structured definition. For example:

```ts
const data = [
  {
    type: "composition",
    offlineMode: false,
    crud: {
      getAll: {
        target: "/compositions",
        useCore: true,
      },
      get: {
        target: (payload) => "/composition/" + payload._id,
        useCore: true,
      },
      update: {
        target: (item) => "/composition/" + item._id,
        useCore: true,
        broadcast: true,
      },
      delete: {
        target: (item) => "/composition/" + item._id,
        useCore: true,
        broadcast: true,
      },
      create: {
        target: "/composition",
        useCore: true,
        broadcast: true,
      },
    },
  },
]
```

In this example, the plugin exposes CRUD endpoints for the resource type composition.

## Using the Plugin API in Components

To interact with these endpoints, you can use the `usePluginApi()` composable inside your Vue component:

```typescript
import { usePluginApi } from "@raclettejs/raclette-core/orchestrator"

const { $data, $store } = usePluginApi()
```

### Fetching Data

All read endpoints are available via $data and are grouped by their defined type. For example, to fetch a specific composition:

```typescript
const { data, execute } = $data.composition.get()

await execute({ _id: "123" })
console.log(data.value)
```

### Sending Data

To create, update, or delete resources, use `$store` with the corresponding method.

You can either call a specific method like `update`, `delete`, etc.:

```typescript
await $store.composition.updateData(id.value, { ... })
```

Or use the generic helper method `createData`, which takes the data and the type name as arguments:

```typescript
await $store.createData({ ... }, "composition")
```

## Summary

The Plugin API abstracts away raw HTTP calls and provides a declarative way to consume backend functionality. By separating route definitions from component logic, Raclette encourages cleaner, more maintainable code within plugins.