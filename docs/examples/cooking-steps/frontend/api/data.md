---
DATA_ALIAS: data
DATAARR_ALIAS: dataArr
QUERY_ALIAS: query
EXECUTE_ALIAS: execute
RESPONSE_ALIAS: response
ISLOADING_ALIAS: isLoading
BUSINESSLOGIC: /* YOUR BUSINESS LOGIC */
ERROR_ALIAS: error
QUERY_PARAMS: {}
ROUTENAME: getAll
DATATYPE: example
IMMEDIATE: false
USESTORE: true | false
NOTIFY: true | false
RESPONSETYPE: '"json" | "stream"'
MODE: '"none" | "cors"'
QUERY_ID: false
CALLBACK: (result) => {}
USECACHE: true | false
QUERYCONFIG: {}
---

```typescript
const { $data, [...] } = usePluginApi()
const {{{$frontmatter.DATA_ALIAS}}, {{$frontmatter.DATAARR_ALIAS}}, {{$frontmatter.RESPONSE_ALIAS}}, {{$frontmatter.QUERY_ALIAS}}, {{$frontmatter.EXECUTE_ALIAS}}, {{$frontmatter.ISLOADING_ALIAS}}, {{$frontmatter.ERROR_ALIAS}} } = $data.{{$frontmatter.DATATYPE}}.{{$frontmatter.ROUTENAME}}({
  params: {{$frontmatter.QUERY_PARAMS}},
  id: {{$frontmatter.QUERY_ID}},
  options: {
    immediate: {{$frontmatter.IMMEDIATE}},
    cb: {{$frontmatter.CALLBACK}},
    useStore: {{$frontmatter.USESTORE}},
    notify: {{$frontmatter.NOTIFY}},
    useCache: {{$frontmatter.USECACHE}},
    responseType: {{$frontmatter.RESPONSETYPE}},
    mode: {{$frontmatter.MODE}},
  },
  config: {{$frontmatter.QUERYCONFIG}}
})
```

::: details Returns

- {{$frontmatter.DATA_ALIAS}} - The resultobject
- {{$frontmatter.DATAARR_ALIAS}} - The resultArray
- {{$frontmatter.RESPONSE_ALIAS}} - The response from the server
- {{$frontmatter.QUERY_ALIAS}} - the query object (only in reading queries)
- {{$frontmatter.EXECUTE_ALIAS}} - an awaitable funciton to trigger the action call. The response and result returned from this functions are not reactive! Use {{$frontmatter.DATAARR_ALIAS}} or {{$frontmatter.DATA_ALIAS}}
- {{$frontmatter.ISLOADING_ALIAS}} - a boolean indicator for the loading/fetch state
- {{$frontmatter.ERROR_ALIAS}} - contains the error object if errors are catched

::::

::: details Props

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
