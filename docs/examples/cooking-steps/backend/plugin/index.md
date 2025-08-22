```typescript
import type {
  PluginOptions,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { createModels } from "./${DATATYPE:example}.model"
import { registerRoutes } from "./routes"
import { registerPayload } from "./helpers/${DATATYPE:example}Helper"
import { register${SCHEMANAME:Example}Schemas } from "./${DATATYPE:example}.schema"
import { register${SCHEMANAME:Example}Crud } from "./helpers/crud"
import { create${SCHEMANAME:Example}Service } from "./${DATATYPE:example}.service"

const ${DATATYPE:example}Plugin = async (
  fastify: PluginFastifyInstance,
  _opts: PluginOptions,
) => {
  /*
   * ---------------------------------------------------------------------
   * CREATE AND REGISTER ALL YOUR MODELS
   * ---------------------------------------------------------------------
   */
  const models = createModels(fastify)

  const ${DATATYPE:example}Service = create${SCHEMANAME:Example}Service(models.${DATATYPE:example})

  fastify.custom.${DATATYPE:example}Service = ${DATATYPE:example}Service

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
  register${SCHEMANAME:Example}Schemas(fastify)
  register${SCHEMANAME:Example}Crud(fastify)

  fastify.registerForFrontendGeneration({
    entityMapping: {
      ${DATATYPE:example}: "${DATATYPE:example}",
    },
  })
}
export default ${DATATYPE:example}Plugin

```
