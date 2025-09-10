---
IMPORT:
BUSINESSLOGIC:
---

```typescript
import type { PluginFastifyInstance } from "@raclettejs/core"
{{$frontmatter.IMPORT}}

export const registerRoutes = async (fastify: PluginFastifyInstance) => {
  // Register individual routes
  {{$frontmatter.BUSINESSLOGIC}}
}

```
