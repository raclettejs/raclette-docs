# `.raclette`

::: tip

To avoid tracking dependencies in version control, make sure this directory is listed in your [`.gitignore`](/docs/directory-structure/gitignore.md) file.

:::

The `.raclette` directory is the internal build output folder created automatically by the Raclette build process. It contains all generated files that are used to run the application, such as compiled code, configuration artifacts, and temporary resources.

In most cases, you won't need to interact with this directory. It's primarily intended for internal use and can safely be ignored during normal development.

::: warning

You should not make manual changes to any files inside `.raclette`, as the contents will be overwritten on the next build.

:::
