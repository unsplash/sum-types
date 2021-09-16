module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "expect-type", "functional"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:expect-type/recommended",
    "plugin:functional/all",
  ],
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
  rules: {
    "functional/prefer-type-literal": 0,
    "functional/no-expression-statement": [
      2,
      { ignorePattern: "(describe)|(it)|(expect)|(fc.)" },
    ],
    "@typescript-eslint/array-type": [1, { default: "generic" }],
    "@typescript-eslint/strict-boolean-expressions": [
      2,
      {
        /** Unset default (`true`) */
        allowString: false,
        /** Unset default (`true`) */
        allowNumber: false,
        /** Unset default (`true`) */
        allowNullableObject: false,
      },
    ],
  },
}
