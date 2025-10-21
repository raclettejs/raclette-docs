# raclette Plugin Architecture: Server-Side Guide

This guide demonstrates how to create robust backend-side plugins in the raclette framework. Plugins in raclette are self-contained modules that can define their own business logic, database models, API endpoints, and services. This architectural pattern promotes modularity, reusability, and maintainability in your applications.

## Plugin Structure Overview

A raclette plugin follows a standardized directory structure that separates concerns and promotes code organization:

```
plugins/
└── your_plugin_name/
    └── backend/
        ├── index.ts              # Plugin entry point and registration
        ├── [model].model.ts      # Database models (Mongoose schemas)
        ├── [model].schema.ts     # TypeBox schemas for validation
        ├── [model].service.ts    # Business logic and data operations
        └── routes/
            ├── index.ts          # Route registration
            └── route.[model].[action].ts  # Individual route handlers
```

The plugin name in the directory structure (`your_plugin_name`) becomes the plugin identifier and is used throughout the framework for namespacing and organization.

## Core Components Deep Dive

### 1. Plugin Entry Point (`index.ts`)

The main plugin file serves as the orchestration layer, bringing together all components and registering them with the Fastify instance.

```typescript
import type { PluginOptions, PluginFastifyInstance } from "@_/types/plugins"
import { createModels } from "./todo.model"
import { registerRoutes } from "./routes"
import { registerPayload } from "./helpers/todoHelper"
import { registerTodoSchemas } from "./todo.schema"
import { registerTodoCrud } from "./helpers/crud"
import { createTodoService } from "./todo.service"

const todoPlugin = async (
  fastify: PluginFastifyInstance,
  opts: PluginOptions
) => {
  // Create and register database models
  const models = createModels(fastify)

  // Initialize service layer
  const todoService = createTodoService(models.todo)
  fastify.todoService = todoService

  // Register routes with error handling
  try {
    await fastify.register((instance) => registerRoutes(instance, models, opts))
  } catch (error) {
    fastify.log.error(`Failed to register routes.`, error)
    throw error
  }

  // Register additional components
  registerPayload(fastify)
  registerTodoSchemas(fastify)
  registerTodoCrud(fastify)
}

export default todoPlugin
```

**Key Responsibilities:**

- Model creation and registration
- Service initialization and injection into Fastify instance
- Route registration with proper error handling
- Schema and helper registration
- Plugin lifecycle management

### 2. Database Models (`todo.model.ts`)

Models define the database schema using Mongoose and establish the data structure for your plugin.

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
import type { Document } from "mongoose"
import { Schema } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export const MODEL_BASENAME = "Todo"

export interface ITodo extends Document<string, unknown, Todo> {
  name: string
  content: string
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
    content: { type: String, required: false },
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
  { timestamps: true }
)

export const createModels = (fastify: PluginFastifyInstance) => {
  const todoModel = fastify.createModel(MODEL_BASENAME, TodoSchema)

  return {
    todo: todoModel,
  }
}
```

**Key Features:**

- UUID-based primary keys for distributed systems
- Soft deletion support via `isDeleted` flag
- User ownership and editing tracking
- Automatic timestamp management
- Framework-integrated model creation using `fastify.createModel()`

### 3. Schema Definitions (`todo.schema.ts`)

TypeBox schemas provide runtime validation and TypeScript type generation for API contracts.

```typescript
import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"

const baseTodoSchema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String(), { default: [] })),
  owner: Type.String(),
  lastEditor: Type.Optional(Type.String()),
  isDeleted: Type.Optional(Type.Boolean({ default: false })),
}

// Full schema for responses
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
  }
)

// Create schema (for POST operations)
export const todoCreateSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    ...baseTodoSchema,
  },
  {
    $id: "#todo/create",
    title: "core/todo-create",
  }
)

// Update schema (for PATCH operations)
export const todoUpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    content: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    lastEditor: Type.Optional(Type.String()),
    isDeleted: Type.Optional(Type.Boolean()),
  },
  {
    $id: "#todo/update",
    title: "core/todo-update",
  }
)

// Type exports for TypeScript
export type Todo = Static<typeof todoSchema>
export type TodoCreate = Static<typeof todoCreateSchema>
export type TodoUpdate = Static<typeof todoUpdateSchema>
```

**Schema Strategy:**

- **Base Schema**: Common fields shared across operations
- **Full Schema**: Complete object with timestamps for responses
- **Create Schema**: Fields required/allowed for creation
- **Update Schema**: Fields that can be modified
- **Type Generation**: Automatic TypeScript types from schemas

### 4. Service Layer (`todo.service.ts`)

The service layer encapsulates business logic, data operations, and provides both raw data access and framework-integrated methods.

```typescript
export class TodoService {
  private todoModel: Model<Todo>

  constructor(model: Model<Todo>) {
    this.todoModel = model
  }

  // Core CRUD operations (return raw data)
  async _createTodo(
    fastify: PluginFastifyInstance,
    todoBody: TodoCreate
  ): Promise<TodoType> {
    // UUID validation and duplicate checking
    if (todoBody._id) {
      const uuidValid = validate(todoBody._id)
      if (!uuidValid) {
        throw new Error("Invalid ID - not a valid uuid v4")
      }

      const duplicate = await this.todoModel.findById(todoBody._id)
      if (duplicate) {
        throw new Error("An entry with this id already exists")
      }
    } else {
      todoBody._id = uuidv4()
    }

    const todo = new this.todoModel(todoBody)
    await todo.save()

    fastify.log.info(`[API] Created todo #${todo._id}`)
    return todo.toObject ? todo.toObject() : todo
  }

  // Framework-integrated operations (return wrapped payloads)
  async createTodo(
    fastify: PluginFastifyInstance,
    requestData: FrontendPayloadRequestData,
    todoBody: TodoCreate
  ): Promise<FrontendPayload<TodoType[]>> {
    const todo = await this._createTodo(fastify, todoBody)
    const payload = await createTodoPayload(fastify, [todo], requestData)

    if (requestData.broadcast) {
      fastify.emit("coreTodoCreated", payload)
    }

    return payload
  }

  // Additional CRUD methods...
}
```

**Service Architecture:**

- **Dual Method Pattern**: Core methods (`_methodName`) return raw data, public methods return framework payloads
- **Event Integration**: Automatic event emission for real-time updates
- **Error Handling**: Comprehensive error catching and logging
- **Payload Wrapping**: Integration with framework's payload system for consistent responses

### 5. Route Registration (`routes/index.ts`)

Centralized route registration provides a clean interface for organizing API endpoints.

```typescript
import type { PluginFastifyInstance, PluginOptions } from "@raclettejs/core"
import type { Model } from "mongoose"
import getAllRoute from "./route.todo.get-all"
import getByIdRoute from "./route.todo.get"
import postRoute from "./route.todo.post"
import patchRoute from "./route.todo.patch"
import deleteRoute from "./route.todo.delete"
import hardDeleteRoute from "./route.todo.hard-delete"

export const registerRoutes = async (
  fastify: PluginFastifyInstance,
  models: Record<string, Model<any>>,
  options: PluginOptions
) => {
  const { key: pluginKey } = options

  // Register individual routes
  fastify.get("/all", getAllRoute(fastify))
  fastify.get("/todo/:_id", getByIdRoute(fastify))
  fastify.post("/todo", postRoute(fastify))
  fastify.patch("/todo/:_id", patchRoute(fastify))
  fastify.delete("/todo/:_id", deleteRoute(fastify))
  fastify.delete("/todo/:_id/hard", hardDeleteRoute(fastify))
}
```

### 6. Individual Route Handlers

Each route handler is a focused module that handles a specific API endpoint.

#### POST Route Example (`route.todo.post.ts`)

```typescript
import type { TodoCreate } from "../todo.schema"
import type { FastifyReply, FastifyRequest } from "fastify"
import { todoCreateSchema } from "../todo.schema"
import type { PluginFastifyInstance } from "@raclettejs/types"

export default (fastify: PluginFastifyInstance) => {
  const handler = async (
    req: FastifyRequest<{ Body: TodoCreate }>,
    reply: FastifyReply
  ) => {
    try {
      const todoData = {
        ...req.body,
        owner: req.user._id,
        lastEditor: req.user._id,
      }

      const payload = await fastify.todoService.createTodo(
        fastify,
        req.requestParams,
        todoData
      )

      return reply.status(201).send(payload)
    } catch (err: any) {
      fastify.log.error(`Error creating todo: ${err.message}`)
      return reply.internalServerError(err.message)
    }
  }

  return {
    handler,
    onRequest: [fastify.authenticate],
    config: {
      type: "dataCreate",
    },
    schema: {
      summary: "Create a new todo",
      description: "Create a new todo",
      tags: ["core/todo"],
      body: todoCreateSchema,
    },
  }
}
```

**Route Handler Pattern:**

- **Factory Function**: Returns route configuration object
- **Authentication**: Built-in authentication middleware
- **Error Handling**: Consistent error responses
- **Schema Validation**: Automatic request/response validation
- **Documentation**: OpenAPI-compatible schema definitions

## Best Practices and Patterns

### 1. Error Handling Strategy

```typescript
try {
  // Operation logic
  const result = await someOperation()
  fastify.log.info(`Operation successful: ${result.id}`)
  return result
} catch (err: any) {
  fastify.log.error(`Operation failed: ${err.message}`)
  throw err // Let the application handle the error
}
```

### 2. Service Injection Pattern

```typescript
// In plugin index.ts
const todoService = createTodoService(models.todo)
fastify.todoService = todoService

// In route handlers
const payload = await fastify.todoService.createTodo(/*...*/)
```

### 3. Schema Reusability

```typescript
const baseTodoSchema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  // ... shared fields
}

// Extend for different use cases
export const todoCreateSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  ...baseTodoSchema,
})
```

### 4. Soft Deletion Implementation

```typescript
// In service methods
async _readTodos(filter: Record<string, any> = { isDeleted: false }) {
  filter = { isDeleted: false, ...filter }
  return await this.todoModel.find(filter).lean()
}

async _removeTodo(id: string) {
  return await this.todoModel
    .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    .lean()
}
```

## Integration with raclette Framework

### Authentication Integration

All routes automatically integrate with the framework's authentication system:

```typescript
return {
  handler,
  onRequest: [fastify.authenticate], // Built-in auth middleware
  // ...
}
```

### Event System Integration

Services can emit events for real-time updates:

```typescript
if (requestData.broadcast) {
  fastify.emit("coreTodoCreated", payload)
}
```

### Payload System Integration

The framework provides a standardized payload wrapper for consistent API responses:

```typescript
const payload = await createTodoPayload(fastify, [todo], requestData)
```

## Creating Your Own Plugin

To create a new plugin following this architecture:

1. **Create the directory structure**: `plugins/your_plugin_name/backend/`
2. **Define your models**: Create Mongoose schemas in `[model].model.ts`
3. **Create validation schemas**: Define TypeBox schemas in `[model].schema.ts`
4. **Implement business logic**: Create service classes in `[model].service.ts`
5. **Build route handlers**: Create individual route files in the `routes/` directory
6. **Register everything**: Tie it all together in the main `index.ts` file

### Plugin Naming Convention

- Use lowercase with underscores: `my_awesome_plugin`
- Avoid special characters except underscores
- Keep names descriptive but concise
- The directory name becomes the plugin identifier

## Advanced Features

### Custom Middleware Integration

```typescript
// In route handlers
return {
  handler,
  onRequest: [fastify.authenticate, customMiddleware],
  // ...
}
```

### Database Relationships

```typescript
owner: {
  type: Schema.Types.String,
  ref: "raclette__core-user", // Reference to user collection
  required: true,
}
```

### Query Options and Pagination

```typescript
async _readTodos(
  filter: Record<string, any> = { isDeleted: false },
  options: QueryOptions = {},
): Promise<TodoType[]> {
  let query = this.todoModel.find(filter)

  if (options.limit !== undefined) {
    query = query.limit(options.limit)
  }
  if (options.offset !== undefined) {
    query = query.skip(options.offset)
  }

  return await query.lean()
}
```

This architecture provides a robust foundation for building scalable, maintainable plugins in the raclette framework. The separation of concerns, consistent patterns, and framework integration points ensure that your plugins will be reliable and easy to extend.
