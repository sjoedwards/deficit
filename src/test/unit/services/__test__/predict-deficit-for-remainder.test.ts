import { createMockContext } from "@shopify/jest-koa-mocks";
import { predictDeficitForRemainderOfMonth } from "../../../../services/predict/predict-deficit-for-remainder";
import { calorieMock } from "../../../acceptance/api-data/calories/mock-default-calorie-data";
import { weightMock } from "../../../acceptance/api-data/weight/mock-default-weight-data";
import { createMockJWT } from "../../../tools/create-mock-jwt";

let ctx = createMockContext();
let calMockservice;
let weightMockService;
const gradient = 0.0039395504356784725;
const intercept = 3.150485609567802;
const goal = -0.25;

beforeEach(() => {
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  calMockservice = calorieMock();
  weightMockService = weightMock(calMockservice.get());
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  ctx = createMockContext();
  ctx.state.token = createMockJWT();
});

describe("Predict deficit for remainder", () => {
  it("Returns the deficit required for the remainder of the month to achieve a set goal", async () => {
    const remainder = await predictDeficitForRemainderOfMonth(
      ctx,
      gradient,
      intercept,
      goal
    );
    expect(remainder).toEqual(-855.1716238827382);
  });
});
