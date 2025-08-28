```typescript
import type { PluginMetadata } from "@raclettejs/core"

export default {
  name: "Example ${SCHEMANAME:Example} Plugin",
  author: "CheesyMcCheeseFace",
  version: "0.0.1",
  description: "My Awesome ${SCHEMANAME:Example} Plugin",
} satisfies PluginMetadata
```
