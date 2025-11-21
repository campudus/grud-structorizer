import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import promise from "eslint-plugin-promise";

export default [
  {
    ignores: ["lib/*", "docs/*", "*.spec.js*", "*.d.ts"]
  },
  js.configs.recommended,
  promise.configs["flat/recommended"],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        // Browser globals
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
        console: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly"
      }
    },
    rules: {
      camelcase: ["warn", { properties: "never" }],
      eqeqeq: ["error", "allow-null"],
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-inner-declarations": ["error", "functions"],
      "no-labels": ["error", { allowLoop: false, allowSwitch: false }],
      "no-return-assign": ["error", "except-parens"],
      "no-unneeded-ternary": ["error", { defaultAssignment: false }],
      "no-unused-vars": ["warn", { vars: "all", args: "none" }],
      "one-var": ["error", { initialized: "never" }],
      "new-cap": ["error", { newIsCap: true, capIsNew: false }],
      "wrap-iife": ["error", "any", { functionPrototypeMethods: true }],
      yoda: ["error", "never"]
    }
  },
  {
    files: ["**/*.spec.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  }
];
