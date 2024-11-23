import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginNext from "eslint-plugin-next";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginNext.configs.coreWebVitals,
  prettier,
  {
    rules: {
      // Add custom rules if necessary
      "react/react-in-jsx-scope": "off", // React is not needed in scope with Next.js
      "no-console": "warn", // Optional: Warn on console usage
    },
  },
];
