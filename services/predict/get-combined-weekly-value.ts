import moment from "moment";
import { NextApiResponse } from "next";
import { simpleMovingWeightAverage } from "../../tools/simple-moving-weight-average";
import {
  FitbitWeeklyCaloriesData,
  FitbitWeeklyWeightData,
  IExtendedRequest,
  IPredictServiceOptions,
} from "../../types";
import { caloriesService } from "../calories";
import { weightService } from "../weight";
import { addDataToState } from "./add-data-to-state";
import { getWeightWithDiff } from "./get-weight-with-diff";

export const getCombinedWeeklyValues = async (
  deficitWeeksAgo: number,
  request: IExtendedRequest,
  response: NextApiResponse,
  options?: IPredictServiceOptions
) => {
  const calories = await caloriesService("weekly", request, response);
  const weight = await weightService("weekly", request);
  addDataToState(request, calories, weight);
  const weightWithDiff = getWeightWithDiff(weight) as FitbitWeeklyWeightData[];
  const simpleWeightMovingAverage = options?.weightDiffMovingAverage
    ? simpleMovingWeightAverage(
        weightWithDiff,
        options?.weightDiffMovingAverage
      )
    : undefined;
  const weightValues = simpleWeightMovingAverage
    ? simpleWeightMovingAverage
    : weightWithDiff;

  return weightValues
    .map(({ weekEnd, weightDiff }) => {
      // Find the caloriesResponse entry for the dateTime
      const deficit = calories.find(
        (entry) =>
          entry.weekEnd ===
          moment(weekEnd).subtract(deficitWeeksAgo, "week").format("YYYY-MM-DD")
      )?.deficit;

      return {
        weightDiff,
        deficit,
      };
    })
    .filter(
      ({ deficit, weightDiff }) =>
        typeof deficit !== "undefined" &&
        deficit !== "NaN" &&
        typeof weightDiff !== "undefined" &&
        weightDiff !== "NaN"
    );
};
