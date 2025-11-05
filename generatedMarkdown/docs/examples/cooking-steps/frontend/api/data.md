```typescript
const { $data, [...] } = usePluginApi()
const {data, dataArr, response, query, execute, isLoading, error } = $data.example.getAll({
  params: {},
  id: false,
  options: {
    immediate: false,
    cb: (result) => {},
    notify: true | false,
    responseType: "json" | "stream",
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
