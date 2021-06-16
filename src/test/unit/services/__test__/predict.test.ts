import {
  predictWeightDiffForDeficit,
  predictService,
} from "../../../../services/predict";
import { createMockContext } from "@shopify/jest-koa-mocks";
import { logWarning } from "../../../../logger/warn";
import { createMockJWT } from "../../../tools/create-mock-jwt";
import { calorieMock } from "../../../acceptance/api-data/calories/mock-default-calorie-data";
import { weightMock } from "../../../acceptance/api-data/weight/mock-default-weight-data";
jest.mock("../../../../logger/warn");

let realDateNow: () => number;
let ctx = createMockContext();
let calMockservice;
let weightMockService;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  calMockservice = calorieMock();
  weightMockService = weightMock(calMockservice.get());
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  ctx = createMockContext();
  ctx.state.token = createMockJWT();
});

describe("predictService", () => {
  it("should throw an error when resolution is not supported", async () => {
    //@ts-expect-error
    await predictService(ctx, "1000", "fortnightly");
    expect(ctx.throw).toHaveBeenCalledWith(400, "resolution not supported");
  });

  it("should return the correct prediction given a weekly resolution", async () => {
    const prediction = await predictService(ctx, "-1300", "weekly");
    expect(prediction).toEqual({
      rSquaredValue: 0.09111735235647,
      weightDiff: -0.11308176980484691,
    });
  });

  it("should return the correct prediction given a weekly resolution, three point weight diff average", async () => {
    const prediction = await predictService(ctx, "-1300", "weekly", {
      weightDiffMovingAverage: 3,
    });
    expect(prediction).toEqual({
      rSquaredValue: 0.06912166747487314,
      weightDiff: -0.04171263550561191,
    });
  });

  it("should return the correct prediction given a monthly resolution", async () => {
    const prediction = await predictService(ctx, "-1000", "monthly");
    expect(prediction).toEqual({
      rSquaredValue: 0.6530176090803418,
      weightDiff: -0.7890648261106703,
    });
  });
});

describe("predictWeightDiffForDeficit", () => {
  it("should return expected value when given valid input data", () => {
    const weightDiff = [
      { weightDiff: "-0.5", deficit: "-1800" },
      { weightDiff: "-0.25", deficit: "-900" },
      { weightDiff: "-0.125", deficit: "-450" },
    ];
    const deficit = -1345;
    const weeklyDiff = predictWeightDiffForDeficit(weightDiff, deficit, ctx);
    const expected = { rSquaredValue: 1, weightDiff: -0.3736111111111111 };
    expect(weeklyDiff).toEqual(expected);
  });

  it("should log warnings when the predicted value is NaN", () => {
    const NaNWeightDiff = [
      { weightDiff: "-0.5", deficit: "-1800" },
      { weightDiff: "-0.25", deficit: "-900" },
      { weightDiff: "-0.125", deficit: undefined },
    ];
    const deficit = -1345;
    predictWeightDiffForDeficit(NaNWeightDiff, deficit, ctx);
    expect(logWarning).toHaveBeenCalledTimes(2);
    expect((logWarning as jest.Mock).mock.calls[0][0]).toEqual(
      "Determined RSquared value was falsey: NaN"
    );
    expect((logWarning as jest.Mock).mock.calls[1][0]).toEqual(
      "Determined weightDiff value was falsey: NaN"
    );
  });

  it("should not log a warning when the predicted value is 0", () => {
    const zeroWeightDiff = [
      { weightDiff: "-0.1", deficit: "-1000" },
      { weightDiff: "0.1", deficit: "-500" },
    ];
    const deficit = -750;
    predictWeightDiffForDeficit(zeroWeightDiff, deficit, ctx);
  });
});
