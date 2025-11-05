```typescript
import type {
  Example,
  Example as ExampleType,
} from "./example.schema"
import type { QueryOptions } from "@_/types/service"
import { v4 as uuidv4, validate } from "uuid"
import { createTodoPayload } from "./helpers/exampleHelper"
import type {
  PluginFastifyInstance,
  FrontendPayload,
  FrontendPayloadRequestData,
} from "@raclettejs/core/types"
import { Model } from "mongoose"

export class ExampleService {
  private exampleModel: Model<Todo>

  constructor(model: Model<Example>) {
    this.exampleModel = model
  }
  [...]
   /* YOUR BUSINESS LOGIC */
  [...]
}

export const createExampleService = (model: Model<Example>) => {
  return new ExampleService(model)
}

```
