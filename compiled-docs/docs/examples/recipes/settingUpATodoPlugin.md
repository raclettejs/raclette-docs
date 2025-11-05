::: warning

This recipe is not completed yet but should already provide a feeling for what to expect during and after the beta phase

:::

::: info
This step will be made obsolete through code generation during the final period of the Beta phase
::::

# Setting up our Example Todolist Plugin

**Estimated Time:** 20min
**Difficulty:** Easy
**Version:** 0.1.\*

### Context

Will teach you how to setup everything you need to start implementing your business logic.

### Prerequisites

- raclette CLI installed
- raclette Server running
- Node.js 24+

### Our Folderstructure

```
example-todo/
├── raclette.plugin.ts
├── frontend/
│ ├── index.ts
│ └── widgets/
│ └── TodoList/
│ ├── TodoListWidget.vue
│ ├── icon.svg
│ ├── screenshot.png
│ └── setup.ts
└── backend/
    ├── index.ts
    ├── todo.model.ts
    ├── todo.schema.ts
    ├── todo.service.ts
    ├── helpers/
    │ ├── index.ts
    │ └── todoHelper.ts
    └── routes/
        ├── index.ts
        └── route.todo.[action].ts

```

### Setup the plugin metadata

In our `./plugins/example-todo/raclette.plugin.ts` we want to define our meta data

```typescript
import type { PluginMetadata } from "@raclettejs/core"

export default {
  name: "My Todo Plugin",
  author: "CheesyMcCheeseFace",
  version: "0.0.1",
  description: "My Awesome Todo Plugin",
} satisfies PluginMetadata
```

## Server

### Declare a Schema

In our `./plugins/example-todo/backend/todo.schema.ts` we want to define our Data Schema.

```typescript
import type { Static } from "@sinclair/typebox"
import type { Document } from "mongoose"
import { Type } from "@sinclair/typebox"
import { PluginFastifyInstance } from "@raclettejs/core"

/**
 * Base Todo Schema - Fields common to all operations
 */
const baseTodoSchema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String(), { default: [] })),
  owner: Type.String(),
  lastEditor: Type.Optional(Type.String()),
  isDeleted: Type.Optional(Type.Boolean({ default: false })),
}

/**
 * Full Todo Schema - Used for response serialization and database model
 */
export const todoSchema = Type.Object(
  {
    _id: Type.String(),
    ...baseTodoSchema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  {
    $id: "#todo/base",
    title: "core/todo",
  },
)

/**
 * Todo Create Schema - For POST operations
 */
export const todoCreateSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    ...baseTodoSchema,
  },
  {
    $id: "#todo/create",
    title: "core/todo-create",
  },
)

/**
 * Todo Update Schema - For PATCH operations
 */
export const todoUpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    lastEditor: Type.Optional(Type.String()),
    isDeleted: Type.Optional(Type.Boolean()),
  },
  {
    $id: "#todo/update",
    title: "core/todo-update",
  },
)

/**
 * Type Utilities
 */

type DateTimeFields = {
  createdAt: Date
  updatedAt: Date
}

type RawTodo = Static<typeof todoSchema>
export type Todo = Omit<RawTodo, keyof DateTimeFields> & DateTimeFields

type RawTodoCreate = Static<typeof todoCreateSchema>
export type TodoCreate = RawTodoCreate

type RawTodoUpdate = Static<typeof todoUpdateSchema>
export type TodoUpdate = RawTodoUpdate

export interface TodoDoc extends Document<string, unknown, Todo>, Todo {
  _id: string
}
export type AnyTodo = Todo | TodoDoc

/**
 * Register Schema/Type Generation for Shared Folder
 */
export const registerTodoSchemas = (fastify: PluginFastifyInstance) => {
  fastify.registerSchema({
    schema: todoSchema,
    name: "Todo",
  })

  fastify.registerSchema({
    schema: todoCreateSchema,
    name: "TodoCreate",
  })

  fastify.registerSchema({
    schema: todoUpdateSchema,
    name: "TodoUpdate",
  })
}

```

### Declare Model

In our `./plugins/example-todo/backend/todo.model.ts` we want to define our Data model.

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { Document } from "mongoose"
import { Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { Todo } from "./todo.schema"

// this will be used to generate the modelName dynamically
export const MODEL_BASENAME = "Todo"

export interface Todo extends Document<string, unknown, Todo> {
  name: string
  isDeleted: boolean
  tags: Array<string>
  owner: string
  lastEditor: string
}

const TodoSchema: Schema = new Schema(
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
let todoModel
export const createModels = (fastify: PluginFastifyInstance) => {
  // we call the createModel function from the app instance
  // this will handle all necessary prefixing
  todoModel = fastify.createModel(MODEL_BASENAME, TodoSchema)

  return {
    todo: todoModel,
  }
}
export default todoModel
```

### Declare your Helpers

In our `./plugins/example-todo/backend/helpers/crud.ts` we want to define our crud helpers.

```typescript
import { PluginFastifyInstance } from "@raclettejs/core"

export const registerTodoCrud = (fastify: PluginFastifyInstance) => {
  fastify.registerCrudHandlers("todo", {
    create: fastify.custom.todoService.createTodo,
    read: fastify.custom.todoService.readTodo,
    update: fastify.custom.todoService.updateTodo,
    delete: fastify.custom.todoService.removeTodo,
  })
}

```

In our `./plugins/example-todo/backend/helpers/todoHelper.ts` we want to define our plugin helpers.

```typescript
import {
  FrontendPayloadRequestData,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { todo } from "../todo.schema"

export const createtodoPayload = async (
  fastify: PluginFastifyInstance,
  items: todo[],
  requestData: FrontendPayloadRequestData,
) => {
  const res = await fastify.createPayload("todo", items, requestData)
  return res
}

export const registerPayload = (fastify: PluginFastifyInstance) => {
  fastify.registerPayloadHandler<todo>("todo", {
    type: "todo",
    displayName: (item) => item.name || "",
    completion: (item) => item.name || "",

    fields: (item, requestData: FrontendPayloadRequestData) => ({
      owner: "NONE",
      project: requestData.project!,
      tags: [],
    }),
  })
}

```

### Declare a service file

In our `./plugins/example-todo/backend/todo.service.ts` we want to define all necessary services. For now we will only provide the ability to query all todos

```typescript
import type {
  Todo,
  Todo as TodoType,
} from "./todo.schema"
import type { QueryOptions } from "@_/types/service"
import { v4 as uuidv4, validate } from "uuid"
import { createTodoPayload } from "./helpers/todoHelper"
import type {
  PluginFastifyInstance,
  FrontendPayload,
  FrontendPayloadRequestData,
} from "@raclettejs/core/types"
import { Model } from "mongoose"

export class TodoService {
  private todoModel: Model<Todo>

  constructor(model: Model<Todo>) {
    this.todoModel = model
  }
  [...]
   async _readTodos(
     fastify: PluginFastifyInstance,
     filter: Record<string, any> = { isDeleted: false },
     options: QueryOptions = {},
   ): Promise<TodoType[]> {
     filter = { isDeleted: false, ...filter }
   
     try {
       // Start building the query
       let query = this.todoModel.find(filter)
   
       // Apply pagination if provided
       if (options.limit !== undefined) {
         query = query.limit(options.limit)
       }
       if (options.offset !== undefined) {
         query = query.skip(options.offset)
       }
   
       // Apply population if provided
       if (options.populate && Array.isArray(options.populate)) {
         options.populate.forEach((populateOption) => {
           query = query.populate(populateOption as any)
         })
       }
   
       // Execute query
       return await query.lean()
     } catch (err: any) {
       fastify.log.error(err.message)
       throw err
     }
   }
   
   /**
   * Read todos by ID or filter parameters with payload wrapping
   */
   async readTodos(
     fastify: PluginFastifyInstance,
     requestData: FrontendPayloadRequestData,
     filter: { id?: string } = {},
   ): Promise<FrontendPayload<TodoType[]>> {
     try {
       const todos = await this._readTodos(fastify, filter)
   
       return createTodoPayload(fastify, todos, requestData)
     } catch (err: any) {
       fastify.log.error(err.message)
       throw err
     }
   }
  [...]
}

export const createTodoService = (model: Model<Todo>) => {
  return new TodoService(model)
}

```

### Declare an index.ts for your routes and a simple getAll route

At first lets create a super simple getAll route for our datatype. Therefor we create a `./plugins/example-todo/backend/routes/todo.get-all.ts`

```typescript
import type { Static } from "@sinclair/typebox"
import type { FastifyReply, FastifyRequest } from "fastify"
import { Type } from "@sinclair/typebox"
import type { PluginFastifyInstance } from "@raclettejs/types"

const ParamsSchema = Type.Object({
  _id: Type.String(),
})
type Params = Static<typeof ParamsSchema>

export default (fastify: PluginFastifyInstance) => {
  const handler = async (
    req: FastifyRequest<{
      Params: Params
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const payload = await fastify.custom.todoService.readTodos(fastify, req.requestParams)
            return payload
    } catch (err: any) {
      fastify.log.error(err.message)
      return reply.internalServerError(err.message)
    }
  }

  return {
    handler,
    onRequest: [fastify.authenticate],
    config: {
      type: dataUpdate,
      broadcastChannels: ["exampleUpdated"],
    },
    schema: {
      summary: "Example todo get Route",
      description: "Example todo get Route",
      tags: ["myApp/todo"],
      body: exampleBaseSchema,
    },
  }
}

```

In our `./plugins/example-todo/backend/routes/index.ts` we want define all our routes

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import getAllRoute from "./route.todo.get-all"

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  // Register individual routes
await fastify.get("/todo/all", getAllRoute(fastify))
}
```

### Glue it together with cheese

In our `./plugins/example-todo/backend/index.ts` we we want to put everything together

```typescript
import type {
  PluginOptions,
  PluginFastifyInstance,
} from "@raclettejs/core"
import { createModels } from "./todo.model"
import { registerRoutes } from "./routes"
import { registerPayload } from "./helpers/todoHelper"
import { registerTodoSchemas } from "./todo.schema"
import { registerTodoCrud } from "./helpers/crud"
import { createTodoService } from "./todo.service"

const todoPlugin = async (
  fastify: PluginFastifyInstance,
  _opts: PluginOptions,
) => {
  /*
   * ---------------------------------------------------------------------
   * CREATE AND REGISTER ALL YOUR MODELS
   * ---------------------------------------------------------------------
   */
  const models = createModels(fastify)

  const todoService = createTodoService(models.todo)

  fastify.custom.todoService = todoService

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
  registerTodoSchemas(fastify)
  registerTodoCrud(fastify)

  fastify.registerForFrontendGeneration({
    entityMapping: {
      todo: "todo",
    },
  })
}
export default todoPlugin

```

## Frontend

For our Frontend side we want to create a simple todolist widget. So let's prepare everything to start coding in vue!

### Provide i18n and custom modification ability

At first we will define `./plugins/example-todo/frontend/index.ts`. This file is optional but will give you the ability to install plugin dependencies, provide fixtures and i18n as well as custom routes.

```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"

export default defineRaclettePluginFrontend({
  i18n: {
    de: {
      someText: "Etwas Text",
    },
    en: {
      someText: "Some Text",
    },
  },
})
```

### Define the widget Metadata

Now we want to provide some widget meta data for later usage in the drag and drop editor and the frontend itself. We do this in the `./plugins/example-todo/frontend/widgets/TodoList/index.ts`.

```typescript
import type { WidgetDeclaration } from "@raclettejs/core"

export const details = {
  title: "My TodoList widget",
  color: "#6CB5D1",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description: "Write Todos on a list",
} satisfies WidgetDeclaration
const config = {}

export default {
  config,
  details,
}
```

### Define the widgets Entryfile

We have now prepared everything to render our i18n keys in the Frontend. Therefor we need to supply a widget entry file. This Files needs to end on `*Widget.vue` to be detected as such. Lets create the `./plugins/example-todo/frontend/widgets/TodoList/TodoListWidget.vue`

```vue
<template>{{$i18n.t('someText')}}</template>

```

### Head to the Worbench and bring your hotsauce!

After finishing the project initialization wizard you should now be able to see your icon on the lefthand side in the widget layout editor in the composition creation/edit screen. Follow our [workbench guide](../../workbench/introduction) for further information
