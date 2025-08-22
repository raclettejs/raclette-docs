```typescript
import type { Static } from "@sinclair/typebox"
import type { FastifyReply, FastifyRequest } from "fastify"
import { Type } from "@sinclair/typebox"
import type { PluginFastifyInstance } from "@raclettejs/types"

const ParamsSchema = Type.Object({
  _id: Type.String(),
})
type Params = Static<typeof ParamsSchema>

export default (fastify: PluginFastifyInstance) => {
  const handler = async (
    req: FastifyRequest<{
      Params: Params
    }>,
    reply: FastifyReply,
  ) => {
    try {
      ${BUSINESSLOGIC:/* YOUR BUSINESS LOGIC */}
    } catch (err: any) {
      fastify.log.error(err.message)
      return reply.internalServerError(err.message)
    }
  }

  return {
    handler,
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
  }
}

```
