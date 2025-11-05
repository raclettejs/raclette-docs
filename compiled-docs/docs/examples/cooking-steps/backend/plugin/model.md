```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { Document } from "mongoose"
import { Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { Example } from "./example.schema"

// this will be used to generate the modelName dynamically
export const MODEL_BASENAME = "Example"

export interface Example extends Document<string, unknown, Example> {
  name: string
  isDeleted: boolean
  tags: Array<string>
  owner: string
  lastEditor: string
}

const ExampleSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
      required: true,
    },
    name: { type: String, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
    tags: { type: Array, required: false },
    owner: {
      type: Schema.Types.String,
      ref: "raclette__core-user",
      required: true,
    },

    lastEditor: {
      type: Schema.Types.String,
      ref: "raclette__core-user",
      required: true,
    },
  },
  { timestamps: true },
)
let exampleModel
export const createModels = (fastify: PluginFastifyInstance) => {
  // we call the createModel function from the app instance
  // this will handle all necessary prefixing
  exampleModel = fastify.createModel(MODEL_BASENAME, ExampleSchema)

  return {
    example: exampleModel,
  }
}
export default todoModel
```
