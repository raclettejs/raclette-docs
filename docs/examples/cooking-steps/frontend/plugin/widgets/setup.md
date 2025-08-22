```typescript
import type { WidgetDeclaration } from "@raclettejs/core"

export const details = {
  title: "${WIDGETTITLE:My Example Widget}",
  color: "${WIDGETCOLOR:#6CB5D1}",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description: "${WIDGETDESCRIPTION:An example widget}",
} satisfies WidgetDeclaration
const config = {}

export default {
  config,
  details,
}
```
