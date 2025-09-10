---
PLUGINNAME: example-todoplugin
DATATYPE: todo
SCHEMANAME: Todo
STOREACTIONTYPE: dataCreate
BODYSCHEMA: todoCreateSchema
ROUTENAME: create
ROUTEMETHOD: post
RESPONSETYPE: json
---

# Creating Data on the Server

**Estimated Time:** 5min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to create an Item for the previous defined DataType

## Prerequisites

- raclette CLI installed
- raclette Server running
- Node.js 24+
- You have finished the setting up a todo plugin example and it's up and running

## Declare create Service

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/{{$frontmatter.DATATYPE}}.service.ts` we now want to define the service logic for our data creation

<!--@include: ../cooking-steps/backend/plugin/service.md{
BUSINESSLOGIC: |
  async _create{{$frontmatter.SCHEMANAME}}(
        fastify: PluginFastifyInstance,
        {{$frontmatter.DATATYPE}}Body: {{$frontmatter.SCHEMANAME}}Create,
      ): Promise<{{$frontmatter.SCHEMANAME}}Type> {
        try {
          if ({{$frontmatter.DATATYPE}}Body._id) {
            const uuidValid = validate({{$frontmatter.DATATYPE}}Body._id)

            if (!uuidValid) {
              throw new Error("Invalid ID - not a valid uuid v4")
            }

            const duplicate = await this.{{$frontmatter.DATATYPE}}Model.findById({{$frontmatter.DATATYPE}}Body._id)

            if (duplicate) {
              throw new Error("An entry with this id already exists")
            }
          } else {
            {{$frontmatter.DATATYPE}}Body._id = uuidv4()
          }

          const {{$frontmatter.DATATYPE}} = new this.{{$frontmatter.DATATYPE}}Model({{$frontmatter.DATATYPE}}Body)

          await {{$frontmatter.DATATYPE}}.save()
          fastify.log.info(`[API] Created {{$frontmatter.DATATYPE}} #{{$frontmatter.DATATYPE}}._id}`)

          return {{$frontmatter.DATATYPE}}.toObject ? {{$frontmatter.DATATYPE}}.toObject() : {{$frontmatter.DATATYPE}}
        } catch (err: any) {
          fastify.log.error(err.message)
          throw err
        }
      }

      /**
      * Create a new {{$frontmatter.DATATYPE}} with payload wrapping and event emission
      */
      async create{{$frontmatter.SCHEMANAME}}(
        fastify: PluginFastifyInstance,
        requestData: FrontendPayloadRequestData,
        {{$frontmatter.DATATYPE}}Body: {{$frontmatter.SCHEMANAME}}Create,
      ): Promise<FrontendPayload<{{$frontmatter.SCHEMANAME}}Type[]>> {
        const {{$frontmatter.DATATYPE}} = await this._create{{$frontmatter.SCHEMANAME}}(fastify, {{$frontmatter.DATATYPE}}Body)

        const payload = await create{{$frontmatter.SCHEMANAME}}Payload(fastify, [{{$frontmatter.DATATYPE}}], requestData)
        if (requestData.broadcast) {
          fastify.emit("{{$frontmatter.DATATYPE}}Created", payload)
        }

        return payload
      }
}-->

## Declare route on the backend side

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/routes/` we want to create a new route called `{{$frontmatter.DATATYPE}}.create.ts`

<!--@include: ../cooking-steps/backend/plugin/routes/route.md{
BUSINESSLOGIC: |
  // Add owner and lastEditor from the authenticated user
        const {{$frontmatter.DATATYPE}}Data = {
          ...req.body,
          owner: req.user._id,
          lastEditor: req.user._id,
        }

        const payload = await fastify.custom.{{$frontmatter.DATATYPE}}Service.create{{$frontmatter.SCHEMANAME}}(
          fastify,
          req.requestParams,
          {{$frontmatter.DATATYPE}}Data,
        )

        return reply.status(201).send(payload)
}-->

## Creating data in our widget

Now we can query our endpoint with the frontendApi fron our component

<!--@include: ../cooking-steps/frontend/api/data.md -->

After defining our action and the corresponding outputs we can now trigger the action when needed.

```typescript
const createData = async (newItem) => {
  // log the action outputs before and after to see what happens!
  console.log(data, query, execute, isLoading, error)
  const createdItem = await execute(newItem)
  // log the action outputs before and after to see what happens!
  console.log(createdItem)
  console.log(data, query, execute, isLoading, error)
}
```
