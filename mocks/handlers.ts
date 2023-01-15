import { rest } from "msw";
import { dailyCaloriesExpectedResponse } from "../__tests__/expected-responses/calories/daily";
import { dailyWeightExpectedResponse } from "../__tests__/expected-responses/weight/daily";

export const handlers = [
  rest.get("/api/weight/daily", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(dailyWeightExpectedResponse));
  }),

  rest.get("/api/calories/daily", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(dailyCaloriesExpectedResponse));
  }),

  rest.all("*", (req) => {
    return req.passthrough();
  }),
];
