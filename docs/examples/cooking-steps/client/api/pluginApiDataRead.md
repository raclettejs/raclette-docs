```typescript
const { $data } = usePluginApi()
const {
  data,
  query,
  execute,
  isLoading,
  error
} = $data.[DATATYPE].[ROUTENAME]({
  params: [QUERY_PARAMS],
  options: {
    immediate: true,
    cb: (result)=>{},
    useStore: true,
    notify: true,
    responseType: 'json',
    mode: 'cors'
  },
})
```
