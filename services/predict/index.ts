import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  IPredictServiceOptions,
} from "./../../types/index";
import {
  ResolutionNames,
  DeficitGoalData,
  LinearRegressionInformation,
  PredictionData,
} from "../../types";

import {
  linearRegression,
  linearRegressionLine,
  rSquared,
} from "simple-statistics";
import {
  predictDeficitForRemainderOfMonth,
  predictDeficitForRemainderOfQuarter,
} from "./predict-deficit-for-remainder";
import { getMonthlyCalories } from "../calories";
import { getWeightWithDiff } from "./get-weight-with-diff";
import { getCombinedWeeklyValues } from "./get-combined-weekly-value";
import { getMonthlyWeight } from "../weight";
import { getMonth, subMonths } from "date-fns";

export const predictWeightDiffForDeficit = (
  combinedValues: Array<DeficitGoalData>,
  deficit: number,
  linearRegressionInformation: LinearRegressionInformation
): { rSquaredValue: number; weightDiff: number } => {
  const { rSquaredValue, regressionLine } = linearRegressionInformation || {};
  if (!rSquaredValue) {
    console.warn(`Determined RSquared value was falsey: ${rSquaredValue}`);
  }

  const weightDiff = regressionLine(deficit);

  if (!weightDiff) {
    console.warn(`Determined weightDiff value was falsey: ${rSquaredValue}`);
  }

  return { rSquaredValue, weightDiff };
};

export const getLinearRegressionInformation = (
  combinedWeeklyValues: Array<DeficitGoalData>
): LinearRegressionInformation => {
  const coordinates = combinedWeeklyValues.map(({ deficit, weightDiff }) => {
    return [parseFloat(`${deficit}`), parseFloat(`${weightDiff}`)];
  });

  const { m: gradient, b: intercept } = linearRegression(coordinates);
  const regressionLine = linearRegressionLine({ m: gradient, b: intercept });
  const rSquaredValue = rSquared(coordinates, regressionLine);
  return { intercept, gradient, rSquaredValue, regressionLine };
};

const predictService = async (
  dailyWeights: Array<FitbitDailyWeightData>,
  dailyCalories: Array<FitbitDailyCaloriesData>,
  deficit: string,
  resolution: ResolutionNames,
  goal: number,
  options?: IPredictServiceOptions
): Promise<PredictionData | undefined> => {
  if (
    resolution !== "weekly" &&
    resolution !== "monthly" &&
    resolution !== "quarterly"
  ) {
    throw new Error("Resolution not supported.");
  }

  const isWeekly = (resolution: ResolutionNames): resolution is "weekly" => {
    return resolution === "weekly";
  };

  const isMonthly = (resolution: ResolutionNames): resolution is "monthly" => {
    return resolution === "monthly";
  };

  const isQuarterly = (
    resolution: ResolutionNames
  ): resolution is "quarterly" => {
    return resolution === "quarterly";
  };

  if (isWeekly(resolution)) {
    const combinedValues = await getCombinedWeeklyValues(
      1,
      dailyWeights,
      dailyCalories,
      options
    );

    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);

    const weeklyWeightDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      linearRegressionInformation
    );

    const deficitForRemainingDaysThisMonth =
      await predictDeficitForRemainderOfMonth(
        dailyCalories,
        linearRegressionInformation.gradient,
        linearRegressionInformation.intercept,
        goal
      );

    return {
      ...weeklyWeightDiffForDeficit,
      deficitForRemainingDaysThisMonth,
      goal,
      combinedValues,
    };
  }

  if (isQuarterly(resolution)) {
    const combinedValues = await getCombinedWeeklyValues(
      1,
      dailyWeights,
      dailyCalories,
      options
    );

    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);

    const weeklyWeightDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      linearRegressionInformation
    );

    const deficitForRemainingDaysThisQuarter =
      await predictDeficitForRemainderOfQuarter(
        dailyCalories,
        linearRegressionInformation.gradient,
        linearRegressionInformation.intercept,
        goal
      );

    return {
      ...weeklyWeightDiffForDeficit,
      deficitForRemainingDaysThisQuarter,
      goal,
      combinedValues,
    };
  }

  if (isMonthly(resolution)) {
    const calories = await getMonthlyCalories(dailyCalories);
    const weight = await getMonthlyWeight(dailyWeights);

    const weightWithDiff = getWeightWithDiff(weight);

    const getCombinedMonthlyValues = (deficitWeeksAgo: number) =>
      weightWithDiff
        .map(({ monthEnd, weightDiff }) => {
          // Find the caloriesResponse entry for the dateTime
          const deficit = calories.find(
            (entry) =>
              getMonth(new Date(entry.monthEnd)) ===
              getMonth(subMonths(new Date(monthEnd), deficitWeeksAgo))
          )?.deficit;

          return {
            weightDiff,
            deficit,
          };
        })
        .filter(({ deficit }) => typeof deficit !== "undefined");
    const combinedValues = getCombinedMonthlyValues(0);
    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);
    const monthlyDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      linearRegressionInformation
    );

    return { ...monthlyDiffForDeficit, goal, combinedValues };
  }
};

export { predictService };
