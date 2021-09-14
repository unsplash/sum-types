module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "/test/unit/",
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
}
