import { defineConfig } from "vitepress"
import recipeDocsPlugin from "./plugins/recipe-plugin"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "raclette-docs",
  description: "Documentation of the awesome raclette framework.",
  lang: "en-EU",
  head: [["link", { rel: "icon", href: "/favicon.svg" }]],
  // https://vitepress.dev/reference/site-config#cleanurls
  cleanUrls: true,
  srcExclude: ["**/compiled-docs/**/*.md"],
  vite: {
    plugins: [
      recipeDocsPlugin({
        exportCompiled: false,
        exportPath: "./compiled-docs",
        exportExclude: [
          "index.md",
          "README.md",
          "LICENSE.md",
          "generated-md-HEADER.md",
        ],
      }),
    ],
  },
  sitemap: {
    hostname: "https://docs.raclettejs.com",
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      src: "/logo.svg",
      alt: "raclette",
    },
    siteTitle: false,
    nav: [
      { text: "Docs", link: "/docs/introduction/getting-started" },
      { text: "Reference", link: "/reference/raclette-config" },
    ],
    sidebar: {
      "/docs/": [
        {
          text: "Introduction",
          items: [
            {
              text: "What is raclette?",
              link: "/docs/introduction/what-is-raclette",
            },
            {
              text: "Architecture Overview",
              link: "/docs/introduction/architecture",
            },
            {
              text: "Getting Started",
              link: "/docs/introduction/getting-started",
            },
            {
              text: "Raclette CLI",
              link: "/docs/introduction/cli-commands",
            },
          ],
        },
        {
          text: "Workbench",
          items: [
            {
              text: "Introduction",
              link: "/docs/workbench/introduction",
            },
            {
              text: "Compositions",
              link: "/docs/workbench/compositions",
            },
            {
              text: "Interaction Links",
              link: "/docs/workbench/interactionLinks",
            },
            {
              text: "Users",
              link: "/docs/workbench/users",
            },
            {
              text: "Tags",
              link: "/docs/workbench/tags",
            },
            {
              text: "Plugins",
              link: "/docs/workbench/plugins",
            },
          ],
        },
        {
          text: "Plugin Development",
          items: [
            {
              text: "Plugin Metadata",
              link: "/docs/plugin-development/metadata",
            },
            {
              text: "Plugin API",
              link: "/docs/plugin-development/api",
            },
            {
              text: "Plugin Widgets",
              link: "/docs/plugin-development/widgets",
            },
            {
              text: "Plugin Backend Side",
              link: "/docs/plugin-development/backend",
            },
            {
              text: "Cookbook",
              link: "/docs/examples/cookbook",
              items: [
                {
                  text: "Recipes",
                  items: [
                    {
                      text: "Setting up a Todo Plugin",
                      link: "/docs/examples/recipes/settingUpATodoPlugin",
                    },
                    {
                      text: "Creating Data on the backend",
                      link: "/docs/examples/recipes/creatingDataInTheBackend",
                    },
                    {
                      text: "Reading Data from the backend",
                      link: "/docs/examples/recipes/readingDataFromTheBackend",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          text: "Coding with Ai",
          items: [
            {
              text: "Introduction",
              link: "/docs/coding-with-ai/introduction",
            },
          ],
        },
        {
          text: "Official Plugins",
          items: [
            {
              text: "Plugin Boilerplate (temporary)",
              link: "/docs/official-plugins/boilerplate",
            },
            {
              text: "CLI Connector",
              link: "/docs/official-plugins/cli-connector",
            },
          ],
        },
        {
          text: "Directory Structure",
          collapsed: false,
          items: [
            {
              text: "📂 .raclette",
              link: "/docs/directory-structure/raclette",
            },
            {
              text: "📂 node_modules",
              link: "/docs/directory-structure/node_modules",
            },
            {
              text: "📂 plugins",
              link: "/docs/directory-structure/plugins",
            },
            {
              text: "🛠️ eslint.config.mjs",
              link: "/docs/directory-structure/eslint-config",
            },
            {
              text: "⚙️ package.json",
              link: "/docs/directory-structure/package",
            },
            {
              text: "⚙️ packages.json",
              link: "/docs/directory-structure/packages",
            },
            {
              text: "🛠️ raclette.config.js",
              link: "/docs/directory-structure/raclette-config",
            },
            {
              text: "🛠️ tsconfig.json",
              link: "/docs/directory-structure/tsconfig",
            },
            {
              text: "⚙️ .gitignore",
              link: "/docs/directory-structure/gitignore",
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
      { icon: "gitlab", link: "https://gitlab.com/raclettejs" },
      { icon: "github", link: "https://github.com/raclettejs" },
      {
        icon: "linkedin",
        link: "https://www.linkedin.com/company/pacifico-digital-explorations-gmbh",
      },
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
