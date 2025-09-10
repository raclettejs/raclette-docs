---
DATAALIAS: data
QUERYALIAS: query
EXECUTEALIAS: execute
ISLOADINGALIAS: isLoading
BUSINESSLOGIC: /* YOUR BUSINESS LOGIC */
ERRORALIAS: error
QUERY_PARAMS: {}
ROUTENAME: getAll
DATATYPE: example
IMMEDIATE: false
USESTORE: true | false
NOTIFY: true | false
RESPONSETYPE: json | stream
MODE: none | cors
CALLBACK: (result) => {}
---

```typescript
const { $data, [...] } = usePluginApi()
const {{{$frontmatter.DATAALIAS}}, ${{$frontmatter.QUERYALIAS}}, {{$frontmatter.EXECUTEALIAS}}, {{$frontmatter.ISLOADINGALIAS}}, {{$frontmatter.ERRORALIAS}} } = $data.{{$frontmatter.DATATYPE}}.{{$frontmatter.ROUTENAME}}({
  params: {{$frontmatter.QUERY_PARAMS}},
  options: {
    immediate: {{$frontmatter.IMMEDIATE}},
    cb: {{$frontmatter.CALLBACK}},
    useStore: {{$frontmatter.USESTORE}},
    notify: {{$frontmatter.NOTIFY}},
    responseType: "{{$frontmatter.RESPONSETYPE}}",
    mode: "{{$frontmatter.MODE}}",
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

- params - The object you want to send to the backend
- options
  - immediate - If true, the action will be executed right away, defaults to false
  - cb - A function which will get called after the action is resolved. Receives the result object
  - useStore - If false, will not write the data to the redux store, defaults to true
  - notify - if false, will not write into the notification que and snackbar, defaults to true
  - responseType - only used if you want to explicitly receive a http stream. Set to stream in that case, defaults to json
  - mode - if responseType is stream, you can set mode "cors" here

::::
