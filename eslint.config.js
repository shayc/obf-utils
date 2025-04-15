import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier/flat";

export default [
  { ignores: ["node_modules", "dist", "coverage", "public"] },
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        Buffer: "readonly",
        NodeJS: "readonly",
        console: "readonly",
        document: "readonly",
        global: "readonly",
        process: "readonly",
        window: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_+$", varsIgnorePattern: "^_+$" },
      ],
    },
  },
  {
    files: ["src/**/*.test.ts", "src/**/__tests__/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.test.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  prettier,
];
