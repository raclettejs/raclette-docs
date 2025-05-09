<template>
  <div class="tw-border-r tw-p-4 tw-bg-primary-light tw-border-primary">
    <div class="tw-font-bold">Navigation</div>
    <ul>
      <li v-for="(page, index) in pages" :key="index">
        <NuxtLink active-class="tw-text-secondary " :to="{ path: page.path }">{{
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
