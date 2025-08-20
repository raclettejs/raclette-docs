---
outline: [2, 3]
---

<!--@include: ../wip.md-->

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

- Raclette CLI installed
- Raclette Server running
- Node.js 24+

```variables
PLUGINNAME: example-todoplugin
DATATYPE: todo
WIDGETNAME: TodoList
SCHEMANAME: Todo
```

### Our Folderstructure

```
${PLUGINNAME:example-plugin}/
├── raclette.plugin.ts
├── client/
│   ├── index.ts
│   └── widgets/
│       └── ${WIDGETNAME:Example}/
│           └── ${WIDGETNAME:Example}Widget.vue
│           └── setup.ts
└── server/
    ├── index.ts
    ├── ${DATATYPE:example}.model.ts
    ├── ${DATATYPE:example}.schema.ts
    ├── ${DATATYPE:example}.service.ts
    ├── helpers/
    │   ├── index.ts
    │   └── ${DATATYPE:example}Helper.ts
    └── routes/
        ├── index.ts
        └── route.${DATATYPE:example}.[action].ts

```

### Setup the plugin metadata

In our `./plugins/${PLUGINNAME:example-plugin}/raclette.plugin.ts` we want to define our meta data

<!--@include: ../cooking-steps/server/plugin/raclette.plugin.md-->

## Server

### Declare a Schema

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.schema.ts` we want to define our Data Schema.

<!--@include: ../cooking-steps/server/plugin/schema.md-->

### Declare Model

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.model.ts` we want to define our Data model.

<!--@include: ../cooking-steps/server/plugin/model.md-->

### Declare your Helpers

In our `./plugins/${PLUGINNAME:example-plugin}/server/helpers/crud.ts` we want to define our crud helpers.

<!--@include: ../cooking-steps/server/plugin/crudHelper.md-->

In our `./plugins/${PLUGINNAME:example-plugin}/server/helpers/${DATATYPE:example}Helper.ts` we want to define our plugin helpers.

<!--@include: ../cooking-steps/server/plugin/pluginHelper.md-->

### Declare a service file

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.service.ts` we want to define all necessary services. For now we will only provide the ability to query all ${DATATYPE:example}s

<!--@include: ../cooking-steps/server/plugin/service.md{
BUSINESSLOGIC: |
  async _read${SCHEMANAME:Example}s(
      fastify: PluginFastifyInstance,
      filter: Record<string, any> = { isDeleted: false },
      options: QueryOptions = {},
    ): Promise<${SCHEMANAME:Example}Type[]> {
      filter = { isDeleted: false, ...filter }

      try {
        // Start building the query
        let query = this.${DATATYPE:example}Model.find(filter)

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
    * Read ${DATATYPE:example}s by ID or filter parameters with payload wrapping
    */
    async read${SCHEMANAME:Example}s(
      fastify: PluginFastifyInstance,
      requestData: ClientPayloadRequestData,
      filter: { id?: string } = {},
    ): Promise<ClientPayload<${SCHEMANAME:Example}Type[]>> {
      try {
        const ${DATATYPE:example}s = await this._read${SCHEMANAME:Example}s(fastify, filter)

        return create${SCHEMANAME:Example}Payload(fastify, ${DATATYPE:example}s, requestData)
      } catch (err: any) {
        fastify.log.error(err.message)
        throw err
      }
    }
}-->

### Declare an index.ts for your routes and a simple getAll route

At first lets create a super simple getAll route for our datatype. Therefor we create a `./plugins/${PLUGINNAME:example-plugin}/server/routes/${DATATYPE:example}.get-all.ts`

<!--@include: ../cooking-steps/server/plugin/routesRoute.md{
BUSINESSLOGIC: |
  const payload = await fastify.custom.${DATATYPE:example}Service.read${SCHEMANAME:Example}s(fastify, req.requestParams)
        return payload
}-->

In our `./plugins/${PLUGINNAME:example-plugin}/server/routes/index.ts` we want define all our routes

<!--@include: ../cooking-steps/server/plugin/routesIndex.md{
IMPORT: import getAllRoute from "./route.${DATATYPE:example}.get-all"
BUSINESSLOGIC: |
    await fastify.get("/${DATATYPE:example}/all", getAllRoute(fastify))
}-->

### Glue it together with cheese

In our `./plugins/${PLUGINNAME:example-plugin}/server/index.ts` we we want to put everything together

<!--@include: ../cooking-steps/server/plugin/index.md-->

## Client

[WIP]
