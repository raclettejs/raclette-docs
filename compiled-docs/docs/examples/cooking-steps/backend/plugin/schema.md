```typescript
import type { Static } from "@sinclair/typebox"
import type { Document } from "mongoose"
import { Type } from "@sinclair/typebox"
import { PluginFastifyInstance } from "@raclettejs/core"

/**
 * Base Example Schema - Fields common to all operations
 */
const baseExampleSchema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String(), { default: [] })),
  owner: Type.String(),
  lastEditor: Type.Optional(Type.String()),
  isDeleted: Type.Optional(Type.Boolean({ default: false })),
}

/**
 * Full Example Schema - Used for response serialization and database model
 */
export const exampleSchema = Type.Object(
  {
    _id: Type.String(),
    ...baseExampleSchema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  {
    $id: "#example/base",
    title: "core/example",
  },
)

/**
 * Example Create Schema - For POST operations
 */
export const exampleCreateSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    ...baseExampleSchema,
  },
  {
    $id: "#example/create",
    title: "core/example-create",
  },
)

/**
 * Example Update Schema - For PATCH operations
 */
export const exampleUpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    lastEditor: Type.Optional(Type.String()),
    isDeleted: Type.Optional(Type.Boolean()),
  },
  {
    $id: "#example/update",
    title: "core/example-update",
  },
)

/**
 * Type Utilities
 */

type DateTimeFields = {
  createdAt: Date
  updatedAt: Date
}

type RawExample = Static<typeof exampleSchema>
export type Example = Omit<RawExample, keyof DateTimeFields> & DateTimeFields

type RawExampleCreate = Static<typeof exampleCreateSchema>
export type ExampleCreate = RawExampleCreate

type RawExampleUpdate = Static<typeof exampleUpdateSchema>
export type ExampleUpdate = RawExampleUpdate

export interface ExampleDoc extends Document<string, unknown, Example>, Example {
  _id: string
}
export type AnyExample = Example | ExampleDoc

/**
 * Register Schema/Type Generation for Shared Folder
 */
export const registerExampleSchemas = (fastify: PluginFastifyInstance) => {
  fastify.registerSchema({
    schema: exampleSchema,
    name: "Example",
  })

  fastify.registerSchema({
    schema: exampleCreateSchema,
    name: "ExampleCreate",
  })

  fastify.registerSchema({
    schema: exampleUpdateSchema,
    name: "ExampleUpdate",
  })
}

```
