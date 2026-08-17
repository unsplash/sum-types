import eslint from "@eslint/js"
import typescriptEslintPackage from "@typescript-eslint/eslint-plugin"
import typescriptParserPackage from "@typescript-eslint/parser"
import expectTypePackage from "eslint-plugin-expect-type/configs/recommended"
import functionalPackage from "eslint-plugin-functional"

const typescriptEslint =
  typescriptEslintPackage.default ?? typescriptEslintPackage
const typescriptParser =
  typescriptParserPackage.default ?? typescriptParserPackage
const expectType = expectTypePackage.default ?? expectTypePackage
const functional = functionalPackage.default ?? functionalPackage
const typescriptRecommended =
  typescriptEslint.configs["flat/recommended-type-checked"]

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  eslint.configs.recommended,
  ...(Array.isArray(typescriptRecommended)
    ? typescriptRecommended
    : [typescriptRecommended]),
  expectType,
  {
    ...functional.configs.all,
    files: ["src/**/*.ts", "test/**/*.ts"],
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.lint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "functional/prefer-type-literal": 0,
      "functional/functional-parameters": 0,
      "functional/prefer-immutable-types": 0,
      "functional/readonly-type": 0,
      "functional/no-expression-statements": [
        2,
        { ignoreCodePattern: "(describe)|(it)|(expect)|(fc.)" },
      ],
      "@typescript-eslint/array-type": [1, { default: "generic" }],
      "@typescript-eslint/strict-boolean-expressions": [
        2,
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
    },
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-base-to-string": 0,
      "@typescript-eslint/no-unused-expressions": 0,
      "functional/no-return-void": 0,
      "functional/type-declaration-immutability": 0,
    },
  },
  {
    files: ["test/unit/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": 0,
    },
  },
]
