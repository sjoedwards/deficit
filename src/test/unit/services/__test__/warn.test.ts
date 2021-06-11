import { createMockContext } from "@shopify/jest-koa-mocks";
import { logWarning } from "../../../../logger/warn";

const ctx = createMockContext();

const consoleSpy = jest.spyOn(console, "warn");

afterEach(() => {
  (consoleSpy as jest.Mock).mockClear();
});

describe("Warn Logger", () => {
  it("writes a log warning to the console with the contents of the state", () => {
    ctx.state = { some: "data", is: ["logged"] };
    logWarning("Test", ctx);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Test",
      '{"some":"data","is":["logged"]}'
    );
  });
});
