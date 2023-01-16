import "@testing-library/jest-dom/";
import "@testing-library/jest-dom/extend-expect";

import { server } from "../mocks/server";

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeAll(() => {
  console.log("Starting test suite");
  server.listen();
});
