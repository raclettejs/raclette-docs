import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "raclette-docs",
  description: "Documentation of the awesome raclette framework.",
  lang: "en-EU",
  head: [["link", { rel: "icon", href: "/favicon.svg" }]],

  // https://vitepress.dev/reference/site-config#cleanurls
  cleanUrls: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      src: "/logo.svg",
      alt: "raclette",
    },
    siteTitle: false,
    nav: [
      { text: "Guide", link: "/guide/introduction/getting-started" },
      { text: "Reference", link: "/reference/raclette-config" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            {
              text: "What is raclette?",
              link: "/guide/introduction/what-is-raclette",
            },
            {
              text: "Architecture Overview",
              link: "/guide/introduction/architecture",
            },
            {
              text: "Getting Started",
              link: "/guide/introduction/getting-started",
            },
            {
              text: "Raclette CLI",
              link: "/guide/introduction/cli-commands",
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
          text: "Plugin Development",
          items: [
            {
              text: "Plugin API",
              link: "/guide/plugin-development/api",
            },
            {
              text: "Plugin Widgets",
              link: "/guide/plugin-development/widgets",
            },
            {
              text: "Plugin Server stuff",
            },
            {
              text: "Examples",
            },
          ],
        },
        {
          text: "Official Plugins",
          items: [
            {
              text: "CLI Connector",
              link: "/guide/official-plugins/cli-connector",
            },
            {
              text: "CLI Connector (original by Jan)",
              link: "/guide/official-plugins/cli-connector-original-jan",
            },
          ],
        },
        {
          text: "Directory Structure",
          collapsed: false,
          items: [
            {
              text: "📂 .raclette",
              link: "/guide/directory-structure/raclette",
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

  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ],
})
