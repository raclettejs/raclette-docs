<template>
  <div class="tw-h-screen tw-flex tw-flex-col">
    <nav class="tw-py-4 tw-border-b tw-border-brand tw-bg-muted">
      <div class="tw-flex tw-justify-between tw-container">
        <NuxtLink class="tw-text-brand tw-text-xl" :to="{ path: '/' }">
          <span class="tw-tracking-widest">raclette </span>
          <span>docs</span>
        </NuxtLink>

        <Icon name="i-lucide:sun" />
        <Icon name="i-lucide:moon" />

        <div>
          <ul class="tw-text-lg tw-font-bold">
            <li>
              <NuxtLink
                class="hover:tw-text-teal-500"
                active-class="tw-text-teal-500"
                :to="{ path: '/docs' }"
              >
                Documentation
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <NuxtPage class="tw-h-full" />
  </div>
</template>

<style lang="scss">
body {
  @apply tw-text-text;
  @apply tw-bg-bg;
  @apply tw-transition-colors;
}
</style>
