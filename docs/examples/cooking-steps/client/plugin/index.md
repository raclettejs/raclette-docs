```typescript
import { defineRaclettePluginClient } from "@raclettejs/raclette-core/client"
${IMPORTEXPORTCOMPONENTS:}

export default defineRaclettePluginClient({
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
