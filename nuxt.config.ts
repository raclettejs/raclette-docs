// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",

  app: {
    head: {
      bodyAttrs: {
        class: "dark",
      },
    },
  },

  devtools: { enabled: true },

  css: ["~/assets/styles/main.scss"],

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
  ],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  tailwindcss: {},
})
