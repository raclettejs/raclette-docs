---
DATATYPE: example
PLUGINNAME: example-plugin
STOREACTIONTYPE: '"dataRead" | "dataUpdate" | "dataCreate" | "dataDelete" | "dataHardDelete" | "dataMove" | "dataRestore"'
ROUTEMETHOD: '"get" | "delete" | "patch" | "post"'
ROUTENAME: getAll
---

```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"

export default defineRaclettePluginFrontend({
  data: {
    {{$frontmatter.DATATYPE}}: {
      operations: {
        {{$frontmatter.ROUTENAME}}: {
          target: "/{{$frontmatter.PLUGINNAME}}/{{$frontmatter.ROUTENAME}}",
          method: {{$frontmatter.ROUTEMETHOD}},
          storeActionType: {{$frontmatter.STOREACTIONTYPE}},
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
