<template>
  <div class="tw-text-black tw-h-screen tw-flex tw-flex-col">
    <nav class="tw-py-4 tw-border-b tw-border-primary tw-bg-primary-light">
      <div class="tw-flex tw-justify-between tw-container">
        <NuxtLink class="tw-text-primary tw-text-xl" :to="{ path: '/' }">
          <span class="tw-tracking-widest">raclette </span>
          <span>docs</span>
        </NuxtLink>

        <div>
          <ul class="tw-text-lg tw-font-bold">
            <li>
              <NuxtLink
                class="hover:tw-text-secondary"
                active-class="tw-text-secondary"
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
