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

```typescript
const { $data, [...] } = usePluginApi()
const {data, dataArr, response, query, execute, isLoading, error } = $data.todo.getAll({
  params: {},
  id: false,
  options: {
    immediate: false,
    cb: (result) => {},
    notify: true | false,
    responseType: "json",
    mode: "none" | "cors",
    useCache: true | false,
    useStore: true | false,
  },
  config: {}
})
```

- data - The resultobject
- dataArr - The resultArray
- response - The response from the server
- query - the query object (only in reading queries)
- execute - an awaitable funciton to trigger the action call. The response and result returned from this functions are not reactive! Use dataArr or data
- isLoading - a boolean indicator for the loading/fetch state
- error - contains the error object if errors are catched

::::

- id - if set this will be used instead of the query instance nanoId
- params - The object you want to send to the backend
- options
  - immediate - If true, the action will be executed right away, defaults to false
  - cb - A function which will get called after the action is resolved. Receives the result object
  - useStore - If false, will not write the data to the redux store. The data return will also not be available, use response instead. defaults to true
  - notify - if false, will not write into the notification que and snackbar, defaults to true
  - responseType - only used if you want to explicitly receive a http stream. Set to stream in that case, defaults to json
  - mode - if responseType is stream, you can set mode "cors" here

::::

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
