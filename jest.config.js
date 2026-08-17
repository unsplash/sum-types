module.exports = {
  testEnvironment: "node",
  testRegex: "/test/unit/",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          module: "commonjs",
        },
      },
    ],
  },
}
