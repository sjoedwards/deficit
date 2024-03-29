module.exports = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.ts"],
  globalSetup: "<rootDir>/__tests__/jest.global.setup.ts",
  testEnvironment: "jsdom",
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/src/",
  ],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
};
