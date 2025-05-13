import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "raclette-docs",
  description: "Documentation of the awesome raclette framework.",
  lang: "en-EU",

  // cleanUrls: true, // see: https://vitepress.dev/reference/site-config#cleanurls
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      src: "/logo.svg",
      alt: "raclette",
    },
    siteTitle: false,
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/raclette-config" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            {
              text: "What is raclette?",
              link: "/guide/what-is-raclette",
            },
            { text: "Getting Started", link: "/guide/getting-started" },
            {
              text: "The concept",
              link: "/guide/the-concept",
            },
          ],
        },
        {
          text: "Plugins",
          items: [],
        },
      ],

      "/reference": [
        {
          text: "Reference",
          items: [
            {
              text: "raclette Config",
              link: "/reference/raclette-config",
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],

    search: {
      provider: "local",
    },
  },
})
