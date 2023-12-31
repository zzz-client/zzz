module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverage: true,
  coverageReporters: ["html", "lcov", "cobertura"],
  reporters: ["jest-junit", "default"],
};
