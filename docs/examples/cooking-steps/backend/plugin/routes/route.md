---
SCHEMANAME: Example
DATATYPE: example
STOREACTIONTYPE: dataUpdate
BROADCASTCHANNELS: '"exampleUpdated"'
BUSINESSLOGIC: /* YOUR BUSINESS LOGIC */
ROUTEMETHOD: get
BODYSCHEMA: exampleBaseSchema
ROUTENAME: get
---

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
      {{$frontmatter.BUSINESSLOGIC}}
    } catch (err: any) {
      fastify.log.error(err.message)
      return reply.internalServerError(err.message)
    }
  }

  return {
    handler,
    onRequest: [fastify.authenticate],
    config: {
      type: {{$frontmatter.STOREACTIONTYPE}},
      broadcastChannels: [{{$frontmatter.BROADCASTCHANNELS}}],
    },
    schema: {
      summary: "Example {{$frontmatter.DATATYPE}} {{$frontmatter.ROUTEMETHOD}} Route",
      description: "Example {{$frontmatter.DATATYPE}} {{$frontmatter.ROUTENAME}} Route",
      tags: ["myApp/{{$frontmatter.DATATYPE}}"],
      body: {{$frontmatter.BODYSCHEMA}},
    },
  }
}

```
