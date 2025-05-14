# `package.json`

The minimal `package.json` of your raclette application should look like:

::: code-group

```json [package.json]
{
  "name": "raclette-app",
  "type": "module",
  "scripts": {
    "dev": "raclette dev",
    "down": "raclette down",
    "update": "raclette update",
    "restart": "raclette restart",
    "add-package": "raclette add"
  },
  "dependencies": {
    "@raclettejs/raclette-core": "latest",
    "nuxt": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@raclettejs/raclette-types": "latest",
  }
}
```

:::

[Learn more about the package.json file](https://docs.npmjs.com/cli/v11/configuring-npm/package-json).
