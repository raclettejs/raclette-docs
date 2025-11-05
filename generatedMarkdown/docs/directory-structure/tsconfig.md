# TypeScript Configuration (`tsconfig.json`)

raclette automatically generates a project-specific TypeScript configuration at `.raclette/tsconfig.json`. This file includes all necessary aliases, paths, and compiler options based on your current project setup and selected frontend framework.

To take advantage of this configuration while keeping the flexibility to customize your own TypeScript settings, you can create a root-level `tsconfig.json` file that extends the generated one:

```json
{
  "extends": "./.raclette/tsconfig.json"
}
```

This setup allows you to override or add TypeScript compiler options without having to redefine everything from scratch.
