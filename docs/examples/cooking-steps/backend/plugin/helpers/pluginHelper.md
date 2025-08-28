```typescript
import {
  FrontendPayloadRequestData,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { ${SCHEMANAME:Example} } from "../${DATATYPE:example}.schema"

export const create${SCHEMANAME:Example}Payload = async (
  fastify: PluginFastifyInstance,
  items: ${SCHEMANAME:Example}[],
  requestData: FrontendPayloadRequestData,
) => {
  const res = await fastify.createPayload("${DATATYPE:example}", items, requestData)
  return res
}

export const registerPayload = (fastify: PluginFastifyInstance) => {
  fastify.registerPayloadHandler<${SCHEMANAME:Example}>("${DATATYPE:example}", {
    type: "${DATATYPE:example}",
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
