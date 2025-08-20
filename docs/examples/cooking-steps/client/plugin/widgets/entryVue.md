```vue
<template>${WIDGETTEMPLATE:}</template>

<script setup lang="ts">
${IMPORTS:}

const props = defineProps({
  uuid: {
    type: String,
    required: true,
  },
})

${BUSINESSLOGIC:}
</script>
```
