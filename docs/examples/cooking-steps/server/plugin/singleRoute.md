```typescript
import type { PluginFastifyInstance } from "@raclettejs/raclette-core"
import type { FastifyRequest, FastifyReply } from "fastify"
import payloadHelper from "./payloadHelper"

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  fastify.get("/${DATATYPE:example}/get", {
    handler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      /* YOUR BUSINESS LOGIC */
    },
    onRequest: [fastify.authenticate],
    config: {
      type: "${STOREACTIONTYPE:dataUpdate}",
      broadcastChannels: ["${BROADCASTCHANNELS:exampleUpdated}"],
    },
    schema: {
      summary: "Example Route",
      description: "Example Route",
      tags: ["myApp/${DATATYPE:example}"],
      body: ${DATATYPE:example}BaseSchema,
    },
  })
}
```

::: tip
We recommend to put your actual business logic into .service files and call them from your route
:::
