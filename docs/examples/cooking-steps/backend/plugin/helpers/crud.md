---
SCHEMANAME: Example
DATATYPE: example
---

```typescript
import { PluginFastifyInstance } from "@raclettejs/core"

export const register{{$frontmatter.SCHEMANAME}}Crud = (fastify: PluginFastifyInstance) => {
  fastify.registerCrudHandlers("{{$frontmatter.DATATYPE}}", {
    create: fastify.custom.{{$frontmatter.DATATYPE}}Service.create{{$frontmatter.SCHEMANAME}},
    read: fastify.custom.{{$frontmatter.DATATYPE}}Service.read{{$frontmatter.SCHEMANAME}},
    update: fastify.custom.{{$frontmatter.DATATYPE}}Service.update{{$frontmatter.SCHEMANAME}},
    delete: fastify.custom.{{$frontmatter.DATATYPE}}Service.remove{{$frontmatter.SCHEMANAME}},
  })
}

```
