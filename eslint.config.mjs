// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    semi: ["error", "never"],
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/match-component-file-name": [
      "error",
      {
        extensions: ["vue"],
        shouldMatchCase: true,
      },
    ],
    "vue/match-component-import-name": "error",

    // Other rules from the original config
    "require-await": "error",
    "prefer-const": "error",
    curly: ["error", "all"],
    "padding-line-between-statements": [
      "error",
      // nextline after const
      { blankLine: "always", prev: "const", next: "*" },
      // nextline after let
      { blankLine: "always", prev: "let", next: "*" },
      // allow const after const
      { blankLine: "any", prev: "const", next: "const" },
      // allow let after const
      { blankLine: "any", prev: "const", next: "let" },
      // allow const after let
      { blankLine: "any", prev: "let", next: "const" },
      // allow let after let
      { blankLine: "any", prev: "let", next: "let" },
      // add blank line before return statements
      { blankLine: "always", prev: "*", next: "return" },
      // new line between method declarations
      { blankLine: "always", prev: "const", next: "block-like" },
    ],
  },
});
