```typescript
const { $data } = usePluginApi()
const { data, query, execute, isLoading, error } = $data.${DATATYPE:user}.${ROUTENAME:getAll}({
  params: ${QUERY_PARAMS:null},
  options: {
    immediate: ${IMMEDIATE:false},
    cb: ${CALLBACK:(result) => {}},
    useStore: ${USESTORE:true},
    notify: ${NOTIFY:true},
    responseType: "${RESPONSETYPE:json | stream}",
    mode: ${MODE:"cors"},
  },
})
```

::: details Returns

- data - The resultobject
- query - the query object
- execute - an awaitable funciton to trigger the action call
- isLoading - a boolean indicator for the loading/fetch state
- error - contains the error object if errors are catched

::::

::: details Props

- params - The object you want to send to the server
- options
  - immediate - If true, the action will be executed right away, defaults to false
  - cb - A function which will get called after the action is resolved. Receives the result object
  - useStore - If false, will not write the data to the redux store, defaults to true
  - notify - if false, will not write into the notification que and snackbar, defaults to true
  - responseType - only used if you want to explicitly receive a http stream. Set to stream in that case, defaults to json
  - mode - if responseType is stream, you can set mode "cors" here

::::
