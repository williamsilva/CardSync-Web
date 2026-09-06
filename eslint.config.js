// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        [
          {
            type: "element",
            prefix: "app",
            style: "kebab-case",
          },
          {
            // cs-selection-header/cs-table-column-header decoram um <th> existente
            // (th[appSelectionHeader]) - forma legítima de attribute selector num @Component,
            // não dá pra virar elemento sem reescrever o uso das duas telas que consomem.
            type: "attribute",
            prefix: "app",
            style: "camelCase",
          },
        ],
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/elements-content": ["error", { allowList: ["label"] }],
      // Campos como number|null|undefined precisam do != solto pra cobrir os dois - trocar por
      // !== faria undefined escapar da checagem de "existe" (bug real, não só estilo).
      "@angular-eslint/template/eqeqeq": ["error", { allowNullOrUndefined: true }],
    },
  }
]);
