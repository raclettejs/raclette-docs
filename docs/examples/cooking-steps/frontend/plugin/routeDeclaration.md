```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"

export default defineRaclettePluginFrontend({
  data: {
    ${DATATYPE:example}: {
      operations: {
        ${ROUTENAME:getAll}: {
          target: "/${PLUGINNAME:example-plugin}/${ROUTENAME:getAll}",
          method: "${ROUTEMETHOD:get | delete | patch | post}",
          storeActionType: "${STOREACTIONTYPE:dataPush | dataUpdate | dataCreate | dataDelete | dataHardDelete | dataMove | dataRestore}",
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
- storeActionType - determines how a response from this endpoint is interpreted by the store can be "dataPush, dataUpdate, dataCreate, dataDelete, dataHardDelete, dataMove, dataRestore"

::::
