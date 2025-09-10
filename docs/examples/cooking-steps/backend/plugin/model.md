---
SCHEMANAME: Example
DATATYPE: example
---

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { Document } from "mongoose"
import { Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { {{$frontmatter.SCHEMANAME}} } from "./{{$frontmatter.DATATYPE}}.schema"

// this will be used to generate the modelName dynamically
export const MODEL_BASENAME = "{{$frontmatter.SCHEMANAME}}"


export interface {{$frontmatter.SCHEMANAME}} extends Document<string, unknown, {{$frontmatter.SCHEMANAME}}> {
  name: string
  isDeleted: boolean
  tags: Array<string>
  owner: string
  lastEditor: string
}

const {{$frontmatter.SCHEMANAME}}Schema: Schema = new Schema(
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
let {{$frontmatter.DATATYPE}}Model
export const createModels = (fastify: PluginFastifyInstance) => {
  // we call the createModel function from the app instance
  // this will handle all necessary prefixing
  {{$frontmatter.DATATYPE}}Model = fastify.createModel(MODEL_BASENAME, {{$frontmatter.SCHEMANAME}}Schema)

  return {
    {{$frontmatter.DATATYPE}}: {{$frontmatter.DATATYPE}}Model,
  }
}
export default todoModel
```
