<template>
  <div class="tw-border-r tw-p-4 tw-bg-muted tw-border-brand">
    <div class="tw-font-bold">Navigation</div>
    <ul>
      <li v-for="(page, index) in pages" :key="index">
        <NuxtLink active-class="tw-text-teal-500 " :to="{ path: page.path }">{{
          page.title
        }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { data: contents } = await useAsyncData("all-tocs", () =>
  queryCollection("docs").all()
)

const pages = computed(() =>
  contents.value?.map((content) => ({
    title: content.title,
    path: content.path,
  }))
)
</script>
