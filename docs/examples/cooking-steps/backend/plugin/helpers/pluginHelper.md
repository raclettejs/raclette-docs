---
SCHEMANAME: Example
DATATYPE: example
---

```typescript
import {
  FrontendPayloadRequestData,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { {{$frontmatter.DATATYPE}} } from "../{{$frontmatter.DATATYPE}}.schema"

export const create{{$frontmatter.DATATYPE}}Payload = async (
  fastify: PluginFastifyInstance,
  items: {{$frontmatter.DATATYPE}}[],
  requestData: FrontendPayloadRequestData,
) => {
  const res = await fastify.createPayload("{{$frontmatter.DATATYPE}}", items, requestData)
  return res
}

export const registerPayload = (fastify: PluginFastifyInstance) => {
  fastify.registerPayloadHandler<{{$frontmatter.DATATYPE}}>("{{$frontmatter.DATATYPE}}", {
    type: "{{$frontmatter.DATATYPE}}",
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
