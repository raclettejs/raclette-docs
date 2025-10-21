// Import required plugins and parsers
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"
import preferArrow from "eslint-plugin-prefer-arrow-functions"
import vue from "eslint-plugin-vue"
import vueEslintParser from "vue-eslint-parser"

// Exported configuration that can be extended
export const racletteEslintConfig = [
  // TS ESLint base rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      // Essential TypeScript syntax rules - equivalent to tseslint.configs.recommended
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.d.ts",
      ".raclette/**",
      "**/examples/**/*.md",
    ],
  },

  // JavaScript config
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        test: "readonly",
        expect: "readonly",
        it: "readonly",
        cy: "readonly",
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // Common recommended rules
      "no-console": "warn",
      "prefer-const": "error",
      "no-unused-vars": "warn",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "require-await": "error",
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
  },

  // Style recommended config
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      // Style and formatting rules
      semi: ["error", "never"],
      quotes: ["error", "double", { avoidEscape: true }],
      "comma-dangle": ["error", "always-multiline"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "computed-property-spacing": ["error", "never"],
      "comma-spacing": ["error", { before: false, after: true }],
      "eol-last": ["error", "always"],
      indent: ["error", 2],
      "linebreak-style": ["error", "unix"],
      "no-trailing-spaces": "error",
    },
  },

  // TypeScript config
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "prefer-arrow": preferArrow,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Basic TypeScript rules
      "no-unused-vars": "off", // disable JS rule in favor of TS rule
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern:
            "^(_|error|config|options|args|props|params|fastify|req|request|res|reply)",
          varsIgnorePattern: "^(_|error|config|options|args|props|params)",
          caughtErrorsIgnorePattern:
            "^(_|error|config|options|args|props|params)",
        },
      ],
    },
  },

  // Vue config
  {
    files: ["**/*.vue"],
    // Manually add Vue plugin
    plugins: {
      vue,
    },
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      // Essential Vue rules (from ESLint plugin Vue)
      "vue/multi-word-component-names": "off",
      "vue/no-mutating-props": "error",
      "vue/no-reserved-component-names": "error",
      "vue/no-use-v-if-with-v-for": "error",
      "vue/require-v-for-key": "error",
      "vue/valid-template-root": "error",
      "vue/valid-v-bind": "error",
      "vue/valid-v-cloak": "error",
      "vue/valid-v-else-if": "error",
      "vue/valid-v-else": "error",
      "vue/valid-v-for": "error",
      "vue/valid-v-html": "error",
      "vue/valid-v-if": "error",
      "vue/valid-v-model": "error",
      "vue/valid-v-on": "error",
      "vue/valid-v-once": "error",
      "vue/valid-v-pre": "error",
      "vue/valid-v-show": "error",
      "vue/valid-v-slot": "error",
      "vue/valid-v-text": "error",
    },
  },

  // Vue recommended config
  {
    files: ["**/*.vue"],
    rules: {
      // Recommended Vue rules
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/match-component-file-name": [
        "error",
        {
          extensions: ["vue"],
          shouldMatchCase: true,
        },
      ],
      "vue/match-component-import-name": "error",
      "vue/attribute-hyphenation": "error",
      "vue/component-definition-name-casing": ["error", "PascalCase"],
      "vue/html-closing-bracket-newline": "error",
      "vue/html-closing-bracket-spacing": "error",
      "vue/html-end-tags": "error",
      "vue/html-indent": ["error", 2],
      "vue/html-quotes": "error",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "any",
            normal: "any",
            component: "always",
          },
        },
      ],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      "vue/no-multi-spaces": "error",
      "vue/no-spaces-around-equal-signs-in-attribute": "error",
      "vue/no-template-shadow": "error",
      "vue/one-component-per-file": "error",
      "vue/prop-name-casing": ["error", "camelCase"],
      "vue/require-default-prop": "error",
      "vue/require-prop-types": "error",
      "vue/v-bind-style": "error",
      "vue/v-on-style": "error",
      "vue/v-slot-style": "error",
    },
  },

  // Prettier config (must be last)
  {
    rules: {
      ...eslintConfigPrettier.rules,
    },
  },
]

// Helper function for extending the config
export const withRaclette = (...userConfigs) => {
  // Simple array concatenation
  return [...racletteEslintConfig, ...userConfigs.flat()]
}

// Default export for direct usage
export default racletteEslintConfig
