# Plugin API

Raclette plugins expose a flexible and type-safe API to interact with backend routes from within frontend components. This is achieved via the `usePluginApi()` composable, which provides two main access points:

- `$data` – for fetching data from or sending data to defined API endpoints
- `$store` – for sending and retrieving data from the client store
- `$log`- for loggin into the developer console
- `$eventbus` - for plugin or raclett wide event communication
- `$socket` - for the registration of socket listeners

## Defining the Plugin API

Plugin API endpoints are provided to the PluginAPI in a declarative manner. This Endpoints are registered inside each plugin’s client entry point: `plugins/[companyName__pluginName]/client/index.ts`

Here, you can register which routes should be available to the frontend using a structured definition. For example:

```TypeScript
[...]
const data = [
  {
    type: "todo",
    crud: {
      getAll: {
        target: "/all",
      },
      get: {
        target: (payload) => "/todo/" + payload._id,
      },
      update: {
        target: (payload) => "/todo/" + payload._id,
        broadcast: true
      },
      delete: {
        target: (payload) => "/todo/" + payload.docId,
        broadcast: true
      },
      create: {
        target: "/todo",
        broadcast: true
      },
    },
  },
]

export { data, [...] }
```

In this example, the plugin exposes CRUD endpoints for the resource type todo. You can define as many endpoints here as you wish. Each endpoint can be defined using the `pluginEndpointDefinition` type.

::: tip
The endpoints you define under the name "update", "delete", "hardDelete", "restore", "move" and "create" will be available through the $store namespace in the clientApi. All other endpoints will be available in the $data namespace under the data type
:::

## Expanding the Plugin API or Vue Instance

If the index.ts file provides an export called install,

```TypeScript
import VueKonva from "vue-konva"
[...]
const install = async ($installApi: InstallApi, $pluginApi: PluginApi) =>{
  $installApi.addNodeDependency(VueKonva, { options: { prefix: "konva" } })
  const myCustomApiFunctions = {
    myCustomFunction: () => {
      // this function will be available in my component
    }
  }
  return myCustomApiFunctions
}

export { install, [...] }
```

## Using the Plugin API in Components

To interact with these endpoints, you can use the `usePluginApi()` composable inside your Vue component:

```typescript
import { usePluginApi } from "@raclettejs/raclette-core/orchestrator"

const props = defineProps({
  uuid: {
    type: String,
    required: true,
  },
})

const { $data, $store } = usePluginApi()
```

::: danger Caution!
For the moment it is imperative that you provide a uuid prop as stated in the example to your widget entry component. This will not be necessary in v1
:::

### Fetching Data

All read endpoints are available via $data and are grouped by their defined type. For example, to fetch a specific composition:

```typescript
const { data, execute, query } = $data.todo.getAll({
  options: { immediate: true },
})

await execute({ _id: "123" })
console.log(data.value)
```

### Sending Data

To create, update, or delete resources, use `$store` with the corresponding method.

You can either call a specific method like `update`, `delete`, etc.:

```typescript
await $store.updateData(id.value, { ... })
```

Or use the generic helper method `createData`, which takes the data and the type name as arguments:

```typescript
await $store.createData({ ... }, "composition")
```

## Summary

The Plugin API abstracts away raw HTTP calls and provides a declarative way to consume backend functionality. By separating route definitions from component logic, Raclette encourages cleaner, more maintainable code within plugins.

## Type Declarations

::: details Show Type Declarations

```TypeScript
type pluginEndpointDefinition = {
  target: function | string
  method?: string
  useCore?: boolean
}
```

:::
