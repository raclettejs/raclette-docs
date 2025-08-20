```typescript
import type { PluginFastifyInstance } from "@raclettejs/raclette-core"
import type { FastifyRequest, FastifyReply } from "fastify"
import payloadHelper from "./payloadHelper"

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  fastify.${ROUTEMETHOD:get}("/${DATATYPE:example}/${ROUTENAME:get}", {
    handler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      ${BUSINESSLOGIC:/* YOUR BUSINESS LOGIC */}
    },
    onRequest: [fastify.authenticate],
    config: {
      type: "${STOREACTIONTYPE:dataUpdate}",
      broadcastChannels: ["${BROADCASTCHANNELS:exampleUpdated}"],
    },
    schema: {
      summary: "Example ${DATATYPE:example} ${ROUTEMETHOD} Route",
      description: "Example ${DATATYPE:example} ${ROUTENAME} Route",
      tags: ["myApp/${DATATYPE:example}"],
      body: ${BODYSCHEMA:exampleBaseSchema},
    },
  })
}
```
