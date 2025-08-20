# Reading Data from the Server

**Estimated Time:** 5min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to read your previousely defined and created dataItems

## Prerequisites

- Raclette CLI installed
- Raclette Server running
- Node.js 24+
- You have finished the setting up a todo plugin example and it's up and running
- You have created some todo items during the creating data on the server example

```variables-hide-table
PLUGINNAME: example-todoplugin
DATATYPE: todo
BROADCASTCHANNELS: todoUpdated
STOREACTIONTYPE: dataPush
BODYSCHEMA: todoUpdateSchema
ROUTENAME: getAllTodos
ROUTEMETHOD: get
RESPONSETYPE: json
```

## Declare route on the server side

In our `./plugins/${PLUGINNAME:example-plugin}/server/plugin/routes.ts` we want to define our Create route.

<!--@include: ../cooking-steps/server/plugin/singleRoute.md-->

## Declare route on the client side

In our `./plugins/${PLUGINNAME:example-plugin}/client/index.ts` we want to define our Raclette Plugin with our custom clientside endpoints.

<!--@include: ../cooking-steps/client/plugin/routeDeclaration.md-->

## Reading data in our widget

Now we can query our endpoint with the clientApi fron our component

<!--@include: ../cooking-steps/client/api/data.md -->

::: tip
If you want to await the retrieval of your data, set immediate: false and use `await execute()`
:::

After defining our action and the corresponding outputs we can now trigger the action when needed.

```typescript
const getData = async (newItem) => {
  // log the action outputs before and after to see what happens!
  console.log(data, query, execute, isLoading, error)
  const allItems = await execute()
  // log the action outputs before and after to see what happens!
  console.log(allItems)
  console.log(data, query, execute, isLoading, error)
}
```
