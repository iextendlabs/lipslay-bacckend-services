import globals from "globals";
import { defineConfig } from "eslint/config";

import js from "@eslint/js";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "commonjs",
      parserOptions: {
        ecmaVersion: 2021
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    extends: [
      js.configs.recommended
    ],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "warn"
    }
  }, {
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      sourceType: "module"
    }
  }
]);
