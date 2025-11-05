```typescript
import { PluginFastifyInstance } from "@raclettejs/core"

export const registerExampleCrud = (fastify: PluginFastifyInstance) => {
  fastify.registerCrudHandlers("example", {
    create: fastify.custom.exampleService.createExample,
    read: fastify.custom.exampleService.readExample,
    update: fastify.custom.exampleService.updateExample,
    delete: fastify.custom.exampleService.removeExample,
  })
}

```
