import { getWeek, subWeeks } from "date-fns";
import { simpleMovingWeightAverage } from "../../tools/simple-moving-weight-average";
import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  FitbitWeeklyWeightData,
  IPredictServiceOptions,
} from "../../types";
import { getWeeklyCalories } from "../calories";
import { getWeeklyWeight } from "../weight";
import { getWeightWithDiff } from "./get-weight-with-diff";

export const getCombinedWeeklyValues = async (
  deficitWeeksAgo: number,
  dailyWeights: Array<FitbitDailyWeightData>,
  dailyCalories: Array<FitbitDailyCaloriesData>,
  options?: IPredictServiceOptions
) => {
  const calories = await getWeeklyCalories(dailyCalories);
  const weights = await getWeeklyWeight(dailyWeights);

  const weightWithDiff = getWeightWithDiff(weights) as FitbitWeeklyWeightData[];
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
          getWeek(new Date(entry.weekEnd)) ===
          getWeek(subWeeks(new Date(weekEnd), deficitWeeksAgo))
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
