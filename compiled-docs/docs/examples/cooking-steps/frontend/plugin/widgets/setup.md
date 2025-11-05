```typescript
import type { WidgetDeclaration } from "@raclettejs/core"

export const details = {
  title: "My Example Widget",
  color: "#6CB5D1",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description: "An example widget",
} satisfies WidgetDeclaration
const config = {}

export default {
  config,
  details,
}
```
