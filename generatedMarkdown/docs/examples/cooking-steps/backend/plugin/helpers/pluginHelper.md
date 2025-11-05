```typescript
import {
  FrontendPayloadRequestData,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { example } from "../example.schema"

export const createexamplePayload = async (
  fastify: PluginFastifyInstance,
  items: example[],
  requestData: FrontendPayloadRequestData,
) => {
  const res = await fastify.createPayload("example", items, requestData)
  return res
}

export const registerPayload = (fastify: PluginFastifyInstance) => {
  fastify.registerPayloadHandler<example>("example", {
    type: "example",
    displayName: (item) => item.name || "",
    completion: (item) => item.name || "",

    fields: (item, requestData: FrontendPayloadRequestData) => ({
      owner: "NONE",
      project: requestData.project!,
      tags: [],
    }),
  })
}

```
