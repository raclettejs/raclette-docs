```typescript
import type {
  ${SCHEMANAME:Example},
  ${SCHEMANAME:Example} as ${SCHEMANAME:Example}Type,
} from "./${DATATYPE:example}.schema"
import type { QueryOptions } from "@_/types/service"
import { v4 as uuidv4, validate } from "uuid"
import { createTodoPayload } from "./helpers/${DATATYPE:example}Helper"
import type {
  PluginFastifyInstance,
  FrontendPayload,
  FrontendPayloadRequestData,
} from "@raclettejs/core/types"
import { Model } from "mongoose"

export class ${SCHEMANAME:Example}Service {
  private ${DATATYPE:example}Model: Model<Todo>

  constructor(model: Model<${SCHEMANAME:Example}>) {
    this.${DATATYPE:example}Model = model
  }
  [...]
  ${BUSINESSLOGIC:/* YOUR BUSINESS LOGIC */}
  [...]
}

export const create${SCHEMANAME:Example}Service = (model: Model<${SCHEMANAME:Example}>) => {
  return new ${SCHEMANAME:Example}Service(model)
}

```
