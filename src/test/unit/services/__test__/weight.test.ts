import { createMockContext } from "@shopify/jest-koa-mocks";
import { weightMock } from "../../../acceptance/api-data/weight/mock-default-weight-data";
import { weeklyWeightExpectedResponse } from "../../../expected-responses/weight/weekly";
import { createMockJWT } from "../../../tools/create-mock-jwt";
import { weightService } from "./../../../../routes/weight";

let realDateNow: () => number;
let ctx = createMockContext();
let weightMockService;

beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  weightMockService = weightMock();
  weightMockService.mockDefault();
  ctx = createMockContext();
  ctx.state.token = createMockJWT();
});

describe("Weight service", () => {
  it("returns the data at a weekly resolution", async () => {
    const weeklyWeightData = await weightService("weekly", ctx, 1);
    expect(weeklyWeightData).toEqual(weeklyWeightExpectedResponse);
  });
});
