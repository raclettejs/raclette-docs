```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { Document } from "mongoose"
import { Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { ${SCHEMANAME:Example} } from "./${DATATYPE:example}.schema"

// this will be used to generate the modelName dynamically
export const MODEL_BASENAME = "${SCHEMANAME:Example}"


export interface ${SCHEMANAME:Example} extends Document<string, unknown, ${SCHEMANAME:Example}> {
  name: string
  isDeleted: boolean
  tags: Array<string>
  owner: string
  lastEditor: string
}

const ${SCHEMANAME:Example}Schema: Schema = new Schema(
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
      ref: "pacifico_core_user",
      required: true,
    },

    lastEditor: {
      type: Schema.Types.String,
      ref: "pacifico_core_user",
      required: true,
    },
  },
  { timestamps: true },
)
let ${DATATYPE:example}Model
export const createModels = (fastify: PluginFastifyInstance) => {
  // we call the createModel function from the app instance
  // this will handle all necessary prefixing
  ${DATATYPE:example}Model = fastify.createModel(MODEL_BASENAME, ${SCHEMANAME:Example}Schema)

  return {
    ${DATATYPE:example}: ${DATATYPE:example}Model,
  }
}
export default todoModel
```
