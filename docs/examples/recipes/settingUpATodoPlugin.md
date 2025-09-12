---
outline: [2, 3]
PLUGINNAME: example-todo
DATATYPE: todo
WIDGETNAME: TodoList
SCHEMANAME: Todo
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

- raclette CLI installed
- raclette Server running
- Node.js 24+

### Our Folderstructure

```
{{$frontmatter.PLUGINNAME}}/
├── raclette.plugin.ts
├── frontend/
│   ├── index.ts
│   └── widgets/
│       └── {{$frontmatter.WIDGETNAME}}/
│           ├── {{$frontmatter.WIDGETNAME}}Widget.vue
│           ├── icon.svg
│           ├── screenshot.png
│           └── setup.ts
└── backend/
    ├── index.ts
    ├── {{$frontmatter.DATATYPE}}.model.ts
    ├── {{$frontmatter.DATATYPE}}.schema.ts
    ├── {{$frontmatter.DATATYPE}}.service.ts
    ├── helpers/
    │   ├── index.ts
    │   └── {{$frontmatter.DATATYPE}}Helper.ts
    └── routes/
        ├── index.ts
        └── route.{{$frontmatter.DATATYPE}}.[action].ts

```

### Setup the plugin metadata

In our `./plugins/{{$frontmatter.PLUGINNAME}}/raclette.plugin.ts` we want to define our meta data

<!--@include: ../cooking-steps/backend/plugin/raclette.plugin.md-->

## Server

### Declare a Schema

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/{{$frontmatter.DATATYPE}}.schema.ts` we want to define our Data Schema.

<!--@include: ../cooking-steps/backend/plugin/schema.md-->

### Declare Model

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/{{$frontmatter.DATATYPE}}.model.ts` we want to define our Data model.

<!--@include: ../cooking-steps/backend/plugin/model.md-->

### Declare your Helpers

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/helpers/crud.ts` we want to define our crud helpers.

<!--@include: ../cooking-steps/backend/plugin/helpers/crud.md-->

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/helpers/{{$frontmatter.DATATYPE}}Helper.ts` we want to define our plugin helpers.

<!--@include: ../cooking-steps/backend/plugin/helpers/pluginHelper.md-->

### Declare a service file

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/{{$frontmatter.DATATYPE}}.service.ts` we want to define all necessary services. For now we will only provide the ability to query all {{$frontmatter.DATATYPE}}s

<!--@include: ../cooking-steps/backend/plugin/service.md{
BUSINESSLOGIC: |
  async _read{{$frontmatter.SCHEMANAME}}s(
      fastify: PluginFastifyInstance,
      filter: Record<string, any> = { isDeleted: false },
      options: QueryOptions = {},
    ): Promise<{{$frontmatter.SCHEMANAME}}Type[]> {
      filter = { isDeleted: false, ...filter }

      try {
        // Start building the query
        let query = this.{{$frontmatter.DATATYPE}}Model.find(filter)

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
    * Read {{$frontmatter.DATATYPE}}s by ID or filter parameters with payload wrapping
    */
    async read{{$frontmatter.SCHEMANAME}}s(
      fastify: PluginFastifyInstance,
      requestData: FrontendPayloadRequestData,
      filter: { id?: string } = {},
    ): Promise<FrontendPayload<{{$frontmatter.SCHEMANAME}}Type[]>> {
      try {
        const {{$frontmatter.DATATYPE}}s = await this._read{{$frontmatter.SCHEMANAME}}s(fastify, filter)

        return create{{$frontmatter.SCHEMANAME}}Payload(fastify, {{$frontmatter.DATATYPE}}s, requestData)
      } catch (err: any) {
        fastify.log.error(err.message)
        throw err
      }
    }
}-->

### Declare an index.ts for your routes and a simple getAll route

At first lets create a super simple getAll route for our datatype. Therefor we create a `./plugins/{{$frontmatter.PLUGINNAME}}/backend/routes/{{$frontmatter.DATATYPE}}.get-all.ts`

<!--@include: ../cooking-steps/backend/plugin/routes/route.md{
BUSINESSLOGIC: |
  const payload = await fastify.custom.{{$frontmatter.DATATYPE}}Service.read{{$frontmatter.SCHEMANAME}}s(fastify, req.requestParams)
        return payload
}-->

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/routes/index.ts` we want define all our routes

<!--@include: ../cooking-steps/backend/plugin/routes/index.md{
IMPORT: import getAllRoute from "./route.{{$frontmatter.DATATYPE}}.get-all"
BUSINESSLOGIC: |
    await fastify.get("/{{$frontmatter.DATATYPE}}/all", getAllRoute(fastify))
}-->

### Glue it together with cheese

In our `./plugins/{{$frontmatter.PLUGINNAME}}/backend/index.ts` we we want to put everything together

<!--@include: ../cooking-steps/backend/plugin/index.md-->

## Frontend

For our Frontend side we want to create a simple todolist widget. So let's prepare everything to start coding in vue!

### Provide i18n and custom modification ability

At first we will define `./plugins/{{$frontmatter.PLUGINNAME}}/frontend/index.ts`. This file is optional but will give you the ability to install plugin dependencies, provide fixtures and i18n as well as custom routes.

<!--@include: ../cooking-steps/frontend/plugin/index.md-->

### Define the widget Metadata

Now we want to provide some widget meta data for later usage in the drag and drop editor and the frontend itself. We do this in the `./plugins/{{$frontmatter.PLUGINNAME}}/frontend/widgets/{{$frontmatter.WIDGETNAME}}/index.ts`.

<!--@include: ../cooking-steps/frontend/plugin/widgets/setup.md{
WIDGETTITLE: My {{$frontmatter.WIDGETNAME}} widget
WIDGETDESCRIPTION: Write {{$frontmatter.SCHEMANAME}}s on a list
}-->

### Define the widgets Entryfile

We have now prepared everything to render our i18n keys in the Frontend. Therefor we need to supply a widget entry file. This Files needs to end on `*Widget.vue` to be detected as such. Lets create the `./plugins/{{$frontmatter.PLUGINNAME}}/frontend/widgets/{{$frontmatter.WIDGETNAME}}/{{$frontmatter.WIDGETNAME}}Widget.vue`

<!--@include: ../cooking-steps/frontend/plugin/widgets/entryVue.md{
IMPORTS: import { usePluginApi } from "@raclettejs/core/orchestrator/composables"
WIDGETTEMPLATE: {{$i18n.t('someText')}}
BUSINESSLOGIC: const { $i18n } = usePluginApi()
}-->

### Head to the Worbench and bring your hotsauce!

After finishing the project initialization wizard you should now be able to see your icon on the lefthand side in the widget layout editor in the composition creation/edit screen. Follow our [workbench guide](../../workbench/introduction) for further information
