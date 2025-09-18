---
SCHEMANAME: Example
DATATYPE: example
---

```typescript
import type { Static } from "@sinclair/typebox"
import type { Document } from "mongoose"
import { Type } from "@sinclair/typebox"
import { PluginFastifyInstance } from "@raclettejs/core"

/**
 * Base {{$frontmatter.SCHEMANAME}} Schema - Fields common to all operations
 */
const base{{$frontmatter.SCHEMANAME}}Schema = {
  name: Type.String(),
  content: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String(), { default: [] })),
  owner: Type.String(),
  lastEditor: Type.Optional(Type.String()),
  isDeleted: Type.Optional(Type.Boolean({ default: false })),
}

/**
 * Full {{$frontmatter.SCHEMANAME}} Schema - Used for response serialization and database model
 */
export const {{$frontmatter.DATATYPE}}Schema = Type.Object(
  {
    _id: Type.String(),
    ...base{{$frontmatter.SCHEMANAME}}Schema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  {
    $id: "#{{$frontmatter.DATATYPE}}/base",
    title: "core/{{$frontmatter.DATATYPE}}",
  },
)

/**
 * {{$frontmatter.SCHEMANAME}} Create Schema - For POST operations
 */
export const {{$frontmatter.DATATYPE}}CreateSchema = Type.Object(
  {
    _id: Type.Optional(Type.String()),
    ...base{{$frontmatter.SCHEMANAME}}Schema,
  },
  {
    $id: "#{{$frontmatter.DATATYPE}}/create",
    title: "core/{{$frontmatter.DATATYPE}}-create",
  },
)

/**
 * {{$frontmatter.SCHEMANAME}} Update Schema - For PATCH operations
 */
export const {{$frontmatter.DATATYPE}}UpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
    lastEditor: Type.Optional(Type.String()),
    isDeleted: Type.Optional(Type.Boolean()),
  },
  {
    $id: "#{{$frontmatter.DATATYPE}}/update",
    title: "core/{{$frontmatter.DATATYPE}}-update",
  },
)

/**
 * Type Utilities
 */

type DateTimeFields = {
  createdAt: Date
  updatedAt: Date
}

type Raw{{$frontmatter.SCHEMANAME}} = Static<typeof {{$frontmatter.DATATYPE}}Schema>
export type {{$frontmatter.SCHEMANAME}} = Omit<Raw{{$frontmatter.SCHEMANAME}}, keyof DateTimeFields> & DateTimeFields

type Raw{{$frontmatter.SCHEMANAME}}Create = Static<typeof {{$frontmatter.DATATYPE}}CreateSchema>
export type {{$frontmatter.SCHEMANAME}}Create = Raw{{$frontmatter.SCHEMANAME}}Create

type Raw{{$frontmatter.SCHEMANAME}}Update = Static<typeof {{$frontmatter.DATATYPE}}UpdateSchema>
export type {{$frontmatter.SCHEMANAME}}Update = Raw{{$frontmatter.SCHEMANAME}}Update

export interface {{$frontmatter.SCHEMANAME}}Doc extends Document<string, unknown, {{$frontmatter.SCHEMANAME}}>, {{$frontmatter.SCHEMANAME}} {
  _id: string
}
export type Any{{$frontmatter.SCHEMANAME}} = {{$frontmatter.SCHEMANAME}} | {{$frontmatter.SCHEMANAME}}Doc

/**
 * Register Schema/Type Generation for Shared Folder
 */
export const register{{$frontmatter.SCHEMANAME}}Schemas = (fastify: PluginFastifyInstance) => {
  fastify.registerSchema({
    schema: {{$frontmatter.DATATYPE}}Schema,
    name: "{{$frontmatter.SCHEMANAME}}",
  })

  fastify.registerSchema({
    schema: {{$frontmatter.DATATYPE}}CreateSchema,
    name: "{{$frontmatter.SCHEMANAME}}Create",
  })

  fastify.registerSchema({
    schema: {{$frontmatter.DATATYPE}}UpdateSchema,
    name: "{{$frontmatter.SCHEMANAME}}Update",
  })
}

```
