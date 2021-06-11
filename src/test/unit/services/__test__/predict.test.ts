import { predictWeeklyWeightDiffForDeficit } from "../../../../services/predict";
import { createMockContext } from "@shopify/jest-koa-mocks";

import { logWarning } from "../../../../logger/warn";

jest.mock("../../../../logger/warn");

let ctx = createMockContext();
beforeEach(() => {
  ctx = createMockContext();
});

describe("predictWeeklyWeightDiffForDeficit", () => {
  it("should return expected value when given valid input data", () => {
    const weightDiff = [
      { weightDiff: "-0.5", deficit: "-1800" },
      { weightDiff: "-0.25", deficit: "-900" },
      { weightDiff: "-0.125", deficit: "-450" },
    ];
    const deficit = -1345;
    const weeklyDiff = predictWeeklyWeightDiffForDeficit(
      weightDiff,
      deficit,
      ctx
    );
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
    predictWeeklyWeightDiffForDeficit(NaNWeightDiff, deficit, ctx);
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
    predictWeeklyWeightDiffForDeficit(zeroWeightDiff, deficit, ctx);
  });
});
