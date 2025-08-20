```typescript
import { defineRaclettePluginClient } from "@raclettejs/raclette-core/client"
${IMPORTEXPORTCOMPONENTS:}

export default defineRaclettePluginClient({
  install: async ($installApi, $corePluginApi) => {
    ${INSTALLFUNCTIONBODY:}
  },
  data: {
    ${DATADEFINITIONS:}

  },
  exportComponents: {
     ${EXPORTCOMPONENTS:}
  },
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
