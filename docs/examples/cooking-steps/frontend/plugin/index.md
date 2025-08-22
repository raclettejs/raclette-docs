```typescript
import { defineRaclettePluginFrontend } from "@raclettejs/core/frontend"
${IMPORTEXPORTCOMPONENTS:}

export default defineRaclettePluginFrontend({
  ${INSTALLFUNCTIONBODY:}
  ${DATADEFINITIONS:}
  ${EXPORTCOMPONENTS:}
  i18n: {
    de: {
      someText: "Etwas Text",
      ${GERMANTRANSLATION:}
    },
    en: {
      someText: "Some Text",
      ${ENGLISHTRANSLATION:}
    },
  },
})
```
