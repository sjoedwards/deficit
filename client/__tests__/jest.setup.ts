import "@testing-library/jest-dom/";
import "@testing-library/jest-dom/extend-expect";

import { loadEnvConfig } from "@next/env";

beforeAll(() => {
  console.log("Starting test suite");
  loadEnvConfig(process.env.PWD || "");
});
