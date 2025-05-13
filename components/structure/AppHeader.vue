<template>
  <header class="tw-flex tw-p-4 tw-justify-between tw-bg-surface">
    <!-- logo -->
    <NuxtLink class="tw-text-brand tw-text-xl" :to="{ path: '/' }">
      <span class="tw-tracking-widest">raclette </span>
      <span>docs</span>
    </NuxtLink>

    <!-- navigation -->
    <nav class="tw-border-b">
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
    </nav>

    <!-- others -->
    <div>
      <button @click="toggleTheme()">
        <ClientOnly>
          <Icon
            :name="theme === 'light' ? 'i-lucide:sun' : 'i-lucide:moon'"
            size="24px"
          />
          <template #placeholder>
            <div class="tw-size-6" />
          </template>
        </ClientOnly>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const theme = useLocalStorage<"dark" | "light">("colortheme", "dark")

const toggleTheme = () => {
  if (theme.value === "light") {
    theme.value = "dark"
  } else {
    theme.value = "light"
  }
}

watchEffect(() => {
  if (theme.value === "light") {
    document?.body.classList.remove("dark")
  } else {
    document?.body.classList.add("dark")
  }
})
</script>
