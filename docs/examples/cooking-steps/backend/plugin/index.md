---
SCHEMANAME: Example
DATATYPE: example
---

```typescript
import type {
  PluginOptions,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { createModels } from "./{{$frontmatter.DATATYPE}}.model"
import { registerRoutes } from "./routes"
import { registerPayload } from "./helpers/{{$frontmatter.DATATYPE}}Helper"
import { register{{$frontmatter.SCHEMANAME}}Schemas } from "./{{$frontmatter.DATATYPE}}.schema"
import { register{{$frontmatter.SCHEMANAME}}Crud } from "./helpers/crud"
import { create{{$frontmatter.SCHEMANAME}}Service } from "./{{$frontmatter.DATATYPE}}.service"

const {{$frontmatter.DATATYPE}}Plugin = async (
  fastify: PluginFastifyInstance,
  _opts: PluginOptions,
) => {
  /*
   * ---------------------------------------------------------------------
   * CREATE AND REGISTER ALL YOUR MODELS
   * ---------------------------------------------------------------------
   */
  const models = createModels(fastify)

  const {{$frontmatter.DATATYPE}}Service = create{{$frontmatter.SCHEMANAME}}Service(models.{{$frontmatter.DATATYPE}})

  fastify.custom.{{$frontmatter.DATATYPE}}Service = {{$frontmatter.DATATYPE}}Service

  /*
   * ---------------------------------------------------------------------
   * REGISTER ALL YOUR ROUTES
   * ---------------------------------------------------------------------
   */

  try {
    await fastify.register((instance) => registerRoutes(instance))
  } catch (error) {
    fastify.log.error(`Failed to register routes.`, error)
    throw error // Let the application handle the error
  }
  registerPayload(fastify)
  register{{$frontmatter.SCHEMANAME}}Schemas(fastify)
  register{{$frontmatter.SCHEMANAME}}Crud(fastify)

  fastify.registerForFrontendGeneration({
    entityMapping: {
      {{$frontmatter.DATATYPE}}: "{{$frontmatter.DATATYPE}}",
    },
  })
}
export default {{$frontmatter.DATATYPE}}Plugin

```
