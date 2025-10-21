---
PLUGINNAME: example-todoplugin
DATATYPE: todo
BROADCASTCHANNELS: '"todoUpdated", "dataUpdated"'
STOREACTIONTYPE: dataPush
BODYSCHEMA: todoUpdateSchema
SCHEMANAME: Todo
ROUTENAME: getAll
ROUTEMETHOD: get
RESPONSETYPE: '"json"'
---

# Reading Data from the Server

**Estimated Time:** 5min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to read your previousely defined and created dataItems

## Prerequisites

- raclette CLI installed
- raclette Server running
- Node.js 24+
- You have finished the setting up a todo plugin example and it's up and running
- You have created some todo items during the creating data on the backend example

## Reading data in our widget

Now we can query our endpoint with the frontendApi from our component

<!--@include: ../cooking-steps/frontend/api/data.md -->

::: tip
If you want to await the retrieval of your data, set immediate: false and use `await execute()`
:::

After defining our action and the corresponding outputs we can now trigger the action when needed.

```typescript
const getData = async (newItem) => {
  // log the action outputs before and after to see what happens!
  console.log(data, query, execute, isLoading, error)
  const { response, result } = await execute()
  // log the action outputs before and after to see what happens!
  console.log(response, result)
  console.log(data, query, execute, isLoading, error)
}
```

::: tip
Be aware that the returns of execute are not reactive like the data and dataArr
:::
