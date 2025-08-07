```typescript
import { defineRaclettePluginClient } from "@raclettejs/raclette-core/client"

export default defineRaclettePluginClient({
  data: {
    [DATATYPE]: {
      operations: {
        [ROUTENAME]: {
          target: "/company__plugin/myCustomEndpoint",
          method: "get",
        },
      },
    },
  },
})
```
