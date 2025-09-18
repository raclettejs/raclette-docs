---
WIDGETTITLE: My Example Widget
WIDGETCOLOR: #6CB5D1
WIDGETDESCRIPTION: An example widget
---

```typescript
import type { WidgetDeclaration } from "@raclettejs/core"

export const details = {
  title: "{{$frontmatter.WIDGETTITLE}}",
  color: "{{$frontmatter.WIDGETCOLOR}}",
  icon: new URL("./icon.svg", import.meta.url).href,
  images: [new URL("./screenshot.png", import.meta.url).href],
  description: "{{$frontmatter.WIDGETDESCRIPTION}}",
} satisfies WidgetDeclaration
const config = {}

export default {
  config,
  details,
}
```
