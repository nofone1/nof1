/**
 * Jest configuration for Node-side unit tests.
 *
 * Scoped to the Convex billing logic, which is plain TypeScript with no React
 * Native runtime, so it runs on the node environment rather than jest-expo.
 */

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
};
