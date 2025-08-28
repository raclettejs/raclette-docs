```typescript
import { PluginFastifyInstance } from "@raclettejs/core"

export const register${SCHEMANAME:Example}Crud = (fastify: PluginFastifyInstance) => {
  fastify.registerCrudHandlers("${DATATYPE:example}", {
    create: fastify.custom.${DATATYPE:example}Service.create${SCHEMANAME:Example},
    read: fastify.custom.${DATATYPE:example}Service.read${SCHEMANAME:Example},
    update: fastify.custom.${DATATYPE:example}Service.update${SCHEMANAME:Example},
    delete: fastify.custom.${DATATYPE:example}Service.remove${SCHEMANAME:Example},
  })
}

```
