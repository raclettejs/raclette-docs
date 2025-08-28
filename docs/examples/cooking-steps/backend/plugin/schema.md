```typescript
import type { Static } from "@sinclair/typebox"
import type { Document } from "mongoose"
import { Type } from "@sinclair/typebox"
import { PluginFastifyInstance } from "@raclettejs/core"

/**
 * Base ${SCHEMANAME:Example} Schema - Fields common to all operations
 */
const base${SCHEMANAME:Example}Schema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String(), { default: [] })),
  owner: Type.String(),
  lastEditor: Type.Optional(Type.String()),
  isDeleted: Type.Optional(Type.Boolean({ default: false })),
}

/**
 * Full ${SCHEMANAME:Example} Schema - Used for response serialization and database model
 */
export const ${DATATYPE:example}Schema = Type.Object(
  {
    _id: Type.String(),
    ...base${SCHEMANAME:Example}Schema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  {
    $id: "#${DATATYPE:example}/base",
    title: "core/${DATATYPE:example}",
  },
)

/**
 * ${SCHEMANAME:Example} Create Schema - For POST operations
 */
export const ${DATATYPE:example}CreateSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    ...base${SCHEMANAME:Example}Schema,
  },
  {
    $id: "#${DATATYPE:example}/create",
    title: "core/${DATATYPE:example}-create",
  },
)

/**
 * ${SCHEMANAME:Example} Update Schema - For PATCH operations
 */
export const ${DATATYPE:example}UpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    lastEditor: Type.Optional(Type.String()),
    isDeleted: Type.Optional(Type.Boolean()),
  },
  {
    $id: "#${DATATYPE:example}/update",
    title: "core/${DATATYPE:example}-update",
  },
)

/**
 * Type Utilities
 */

type DateTimeFields = {
  createdAt: Date
  updatedAt: Date
}

type Raw${SCHEMANAME:Example} = Static<typeof ${DATATYPE:example}Schema>
export type ${SCHEMANAME:Example} = Omit<Raw${SCHEMANAME:Example}, keyof DateTimeFields> & DateTimeFields

type Raw${SCHEMANAME:Example}Create = Static<typeof ${DATATYPE:example}CreateSchema>
export type ${SCHEMANAME:Example}Create = Raw${SCHEMANAME:Example}Create

type Raw${SCHEMANAME:Example}Update = Static<typeof ${DATATYPE:example}UpdateSchema>
export type ${SCHEMANAME:Example}Update = Raw${SCHEMANAME:Example}Update

export interface ${SCHEMANAME:Example}Doc extends Document<string, unknown, ${SCHEMANAME:Example}>, ${SCHEMANAME:Example} {
  _id: string
}
export type Any${SCHEMANAME:Example} = ${SCHEMANAME:Example} | ${SCHEMANAME:Example}Doc

/**
 * Register Schema/Type Generation for Shared Folder
 */
export const register${SCHEMANAME:Example}Schemas = (fastify: PluginFastifyInstance) => {
  fastify.registerSchema({
    schema: ${DATATYPE:example}Schema,
    name: "${SCHEMANAME:Example}",
  })

  fastify.registerSchema({
    schema: ${DATATYPE:example}CreateSchema,
    name: "${SCHEMANAME:Example}Create",
  })

  fastify.registerSchema({
    schema: ${DATATYPE:example}UpdateSchema,
    name: "${SCHEMANAME:Example}Update",
  })
}

```
