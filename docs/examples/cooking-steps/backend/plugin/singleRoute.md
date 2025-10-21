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
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { FastifyRequest, FastifyReply } from "fastify"
import payloadHelper from "./payloadHelper"

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  fastify.{{$frontmatter.ROUTEMETHOD}}("/{{$frontmatter.DATATYPE}}/{{$frontmatter.ROUTENAME}}", {
    handler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      {{$frontmatter.BUSINESSLOGIC}}
    },
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
  })
}
```
