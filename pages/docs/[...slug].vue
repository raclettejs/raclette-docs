<template>
  <div>
    <div class="tw-flex tw-gap-4 tw-items-stretch tw-h-full">
      <DocumentationNavigation />

      <div class="tw-py-4">
        <ContentRenderer v-if="page" :value="page" />
        <div v-else>page not found :(</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("docs").path(route.path).first()
)

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
})
</script>
