<template>
  <div class="tw-h-screen">
    <div class="tw-flex tw-h-full">
      <SideNavigation />

      <div class="tw-size-full">
        <AppHeader />
        <NuxtPage class="tw-h-full" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
body {
  @apply tw-text-text;
  @apply tw-bg-bg;
  @apply tw-transition-colors;
}
</style>
