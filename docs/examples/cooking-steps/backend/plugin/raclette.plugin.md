---
SCHEMANAME: Example
---

```typescript
import type { PluginMetadata } from "@raclettejs/core"

export default {
  name: "My {{$frontmatter.SCHEMANAME}} Plugin",
  author: "CheesyMcCheeseFace",
  version: "0.0.1",
  description: "My Awesome {{$frontmatter.SCHEMANAME}} Plugin",
} satisfies PluginMetadata
```
