---
EXECUTE_ALIAS: execute
---

```typescript
const getData = async (newItem) => {
  const { response, result } = await {{$frontmatter.EXECUTE_ALIAS}}()
  // log the action outputs before and after to see what happens!
  console.log(response, result)
}
```
