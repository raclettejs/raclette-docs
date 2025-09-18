---
IMPORTS: 
WIDGETTEMPLATE:
BUSINESSLOGIC: 
---

```vue
<template>{{$frontmatter.WIDGETTEMPLATE}}</template>

<script setup lang="ts">
{{$frontmatter.IMPORTS}}

const props = defineProps({
  uuid: {
    type: String,
    required: true,
  },
})

{{$frontmatter.BUSINESSLOGIC}}
</script>
```
