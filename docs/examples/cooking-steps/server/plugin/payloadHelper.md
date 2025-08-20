```typescript
import {
  ClientPayloadRequestData,
  PluginFastifyInstance,
} from "@raclettejs/raclette-core"
import { Example } from "../example.schema"

export const registerPayload = (fastify: PluginFastifyInstance) => {
  fastify.registerPayloadHandler<Canvas>("example", {
    type: "example",
    displayName: (item) => item.name || "",
    completion: (item) => item.name || "",

    fields: (item, requestData: ClientPayloadRequestData) => ({
      owner: "NONE",
      project: requestData.project!,
      tags: [],
    }),
  })
}

export default createExamplePayload = async (
  fastify: PluginFastifyInstance,
  items: [],
  requestData: ClientPayloadRequestData
) => {
  const res = await fastify.createPayload("example", items, requestData)
  return res
}
```
