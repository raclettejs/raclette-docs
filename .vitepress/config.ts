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
            {
              text: "The concept",
              link: "/guide/the-basis",
            },
            {
              text: "Getting Started",
              link: "/guide/getting-started",
            },
          ],
        },
        {
          text: "Admindashboard",
          items: [
            {
              text: "Introduction",
              link: "/guide/admindashboard/introduction",
            },
          ],
        },
        {
          text: "Plugins",
          items: [
            // {
            //   text: "Plugin Overview",
            //   link: "/guide/plugins/overview",
            // },
            {
              text: "Plugin API",
              link: "/guide/plugins/api",
            },
          ],
        },
        {
          text: "Directory Structure",
          collapsed: false,
          items: [
            {
              text: "📂 .raclette",
              link: "/guide/directory-structure/.raclette",
            },
            {
              text: "📂 node_modules",
              link: "/guide/directory-structure/node_modules",
            },
            {
              text: "📂 plugins",
              link: "/guide/directory-structure/plugins",
            },
            {
              text: "🛠️ eslint.config.mjs",
              link: "/guide/directory-structure/eslint-config",
            },
            {
              text: "⚙️ package.json",
              link: "/guide/directory-structure/package",
            },
            {
              text: "⚙️ packages.json",
              link: "/guide/directory-structure/packages",
            },
            {
              text: "🛠️ raclette.config.js",
              link: "/guide/directory-structure/raclette-config",
            },
            {
              text: "🛠️ tsconfig.json",
              link: "/guide/directory-structure/tsconfig",
            },
            {
              text: "⚙️ .gitignore",
              link: "/guide/directory-structure/gitignore",
            },
          ],
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
