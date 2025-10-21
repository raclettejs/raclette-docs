---
SCHEMANAME: Example
DATATYPE: example
BUSINESSLOGIC: /* YOUR BUSINESS LOGIC */
---

```typescript
import type {
  {{$frontmatter.SCHEMANAME}},
  {{$frontmatter.SCHEMANAME}} as {{$frontmatter.SCHEMANAME}}Type,
} from "./{{$frontmatter.DATATYPE}}.schema"
import type { QueryOptions } from "@_/types/service"
import { v4 as uuidv4, validate } from "uuid"
import { createTodoPayload } from "./helpers/{{$frontmatter.DATATYPE}}Helper"
import type {
  PluginFastifyInstance,
  FrontendPayload,
  FrontendPayloadRequestData,
} from "@raclettejs/core/types"
import { Model } from "mongoose"

export class {{$frontmatter.SCHEMANAME}}Service {
  private {{$frontmatter.DATATYPE}}Model: Model<Todo>

  constructor(model: Model<{{$frontmatter.SCHEMANAME}}>) {
    this.{{$frontmatter.DATATYPE}}Model = model
  }
  [...]
   {{$frontmatter.BUSINESSLOGIC}}
  [...]
}

export const create{{$frontmatter.SCHEMANAME}}Service = (model: Model<{{$frontmatter.SCHEMANAME}}>) => {
  return new {{$frontmatter.SCHEMANAME}}Service(model)
}

```
