```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { FastifyRequest, FastifyReply } from "fastify"
import payloadHelper from "./payloadHelper"

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  fastify.get("/example/get", {
    handler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      /* YOUR BUSINESS LOGIC */
    },
    onRequest: [fastify.authenticate],
    config: {
      type: dataUpdate,
      broadcastChannels: ["exampleUpdated"],
    },
    schema: {
      summary: "Example example get Route",
      description: "Example example get Route",
      tags: ["myApp/example"],
      body: exampleBaseSchema,
    },
  })
}
```
