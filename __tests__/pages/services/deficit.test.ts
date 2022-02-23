import { deficitExpectedResponse } from "../../expected-responses/deficit";
import { deficitService } from "../../../services/deficit";
import { FitbitDailyCaloriesData, FitbitDailyWeightData } from "../../../types";
import { dailyCaloriesExpectedResponse } from "../../expected-responses/calories/daily";
import { dailyWeightExpectedResponse } from "../../expected-responses/weight/daily";

let calories: Array<FitbitDailyCaloriesData>;
let weight: Array<FitbitDailyWeightData>;

// This sets the mock adapter on the default instance
beforeEach(() => {
  // stub date to 1 June 2021 22:57:05
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(1622588225000));
  calories = dailyCaloriesExpectedResponse;
  weight = dailyWeightExpectedResponse;
});
afterEach(() => {
  jest.useRealTimers();
});

describe("Deficit handler", () => {
  it("should return the correct deficit information for a weekly resolution", async () => {
    const deficit = await deficitService(weight, calories);

    expect(deficit).toEqual(deficitExpectedResponse);
  });
});
