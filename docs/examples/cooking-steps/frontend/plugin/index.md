---
IMPORTEXPORTCOMPONENTS:
INSTALLFUNCTIONBODY:
DATADEFINITIONS:
EXPORTCOMPONENTS:
GERMANTRANSLATION:
ENGLISHTRANSLATION:
---

```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"
{{$frontmatter.IMPORTEXPORTCOMPONENTS}}

export default defineRaclettePluginFrontend({
  {{$frontmatter.INSTALLFUNCTIONBODY}}
  {{$frontmatter.DATADEFINITIONS}}
  {{$frontmatter.EXPORTCOMPONENTS}}
  i18n: {
    de: {
      someText: "Etwas Text",
      {{$frontmatter.GERMANTRANSLATION}}
    },
    en: {
      someText: "Some Text",
      {{$frontmatter.ENGLISHTRANSLATION}}
    },
  },
})
```
