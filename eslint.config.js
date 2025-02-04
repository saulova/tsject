import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tsEslint from "typescript-eslint";
import eslint from "@eslint/js";

const tsRecommended = tsEslint
  .config(eslint.configs.recommended, ...tsEslint.configs.recommended)
  .map((item) => {
    return {
      ...item,
      files: [
        "packages/cli/**/*.ts",
        "packages/dependency-injection/**/*.ts",
        "packages/dependency-injection-tsc-plugin/**/*.ts",
      ],
    };
  });

export default [
  ...tsRecommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
];
