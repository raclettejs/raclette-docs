<!--@include: ../wip.md-->

::: info
This step will be made obsolete through code generation during the final period of the Beta phase
::::

# Creating Data on the Server

**Estimated Time:** 20min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to setup everything you need to start implementing your business logic.

## Prerequisites

- Raclette CLI installed
- Raclette Server running
- Node.js 24+

```variables-hide-table
PLUGINNAME: example-todoplugin
DATATYPE: todo
WIDGETNAME: TodoList
SCHEMANAME: Todo
```

## Our Folderstructure

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
    │   └── route.${DATATYPE:example}.[action].ts
    └── routes/
        ├── index.ts
        └── route.${DATATYPE:example}.[action].ts

```

## Declare a Schema

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.schema.ts` we want to define our Data Schema.

<!--@include: ../cooking-steps/server/plugin/schema.md-->

## Declare Model

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.model.ts` we want to define our Data model.

<!--@include: ../cooking-steps/server/plugin/model.md-->

## Declare a service file

In our `./plugins/${PLUGINNAME:example-plugin}/server/plugin/${DATATYPE:example}.service.ts` we want to define all necessary services

<!--@include: ../cooking-steps/server/plugin/service.md-->
