```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"

export default defineRaclettePluginFrontend({
  data: {
    example: {
      operations: {
        getAll: {
          target: "/example-plugin/getAll",
          method: "get" | "delete" | "patch" | "post",
          storeActionType: "dataRead" | "dataUpdate" | "dataCreate" | "dataDelete" | "dataHardDelete" | "dataMove" | "dataRestore",
        },
      },
    },
  },
})
```

<!-- TODO find a nice way to import descriptive values from a central point. Here we'd like to source out the storeActionTypes -->

::: details Props

- target - The target URI
- method - the http method to use
- storeActionType - determines how a response from this endpoint is interpreted by the store can be "dataRead, dataUpdate, dataCreate, dataDelete, dataHardDelete, dataMove, dataRestore"

::::
