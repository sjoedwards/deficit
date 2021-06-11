import {
  DeficitGoalData,
  LinearRegressionInformation,
  PredictionData,
} from "../../../types/index";
import { weightService } from "../../routes/weight";
import { caloriesService } from "../../routes/calories";
import { Context } from "koa";
import {
  linearRegression,
  linearRegressionLine,
  rSquared,
} from "simple-statistics";
import moment from "moment";
import { logWarning } from "../../logger/warn";

export const predictWeeklyWeightDiffForDeficit = (
  combinedWeeklyValues: Array<DeficitGoalData>,
  deficit: number,
  ctx: Context
): PredictionData => {
  const { rSquaredValue, regressionLine } = getLinearRegressionInformation(
    combinedWeeklyValues
  );

  if (!rSquaredValue) {
    logWarning(`Determined RSquared value was falsey: ${rSquaredValue}`, ctx);
  }

  const weightDiff = regressionLine(deficit);

  if (!weightDiff) {
    logWarning(`Determined weightDiff value was falsey: ${rSquaredValue}`, ctx);
  }

  return { rSquaredValue, weightDiff };
};

export const getLinearRegressionInformation = (
  combinedWeeklyValues: Array<DeficitGoalData>
): LinearRegressionInformation => {
  const coordinates = combinedWeeklyValues.map(({ deficit, weightDiff }) => {
    return [parseFloat(deficit), parseFloat(weightDiff)];
  });

  const { m: gradient, b: intercept } = linearRegression(coordinates);
  const regressionLine = linearRegressionLine({ m: gradient, b: intercept });
  const rSquaredValue = rSquared(coordinates, regressionLine);
  return { intercept, gradient, rSquaredValue, regressionLine };
};

const predictService = async (
  ctx: Context,
  deficit: string
): Promise<PredictionData> => {
  const weeklyCalories = await caloriesService("weekly", ctx);
  const weeklyWeight = await weightService("weekly", ctx);
  ctx.state.data = {
    ...ctx.state.data,
    weeklyCalories,
    weeklyWeight,
  };
  const weeklyWeightWithDiff = weeklyWeight
    .map((weeklyValue, index) => {
      const previousWeekWeight = parseFloat(weeklyWeight[index - 1]?.weight);
      return {
        ...weeklyValue,
        weightDiff:
          previousWeekWeight &&
          (parseFloat(weeklyValue.weight) - previousWeekWeight)?.toString(),
      };
    })
    .filter(({ weightDiff }) => weightDiff);

  const getCombinedWeeklyValues = (deficitWeeksAgo: number) =>
    weeklyWeightWithDiff
      .map(({ weekEnd, weightDiff }) => {
        // Find the caloriesResponse entry for the dateTime
        const deficit = weeklyCalories.find(
          (entry) =>
            entry.weekEnd ===
            moment(weekEnd)
              .subtract(deficitWeeksAgo, "week")
              .format("YYYY-MM-DD")
        )?.deficit;

        return {
          weightDiff,
          deficit,
        };
      })
      .filter(({ deficit }) => typeof deficit !== "undefined");

  const getDeficitForWeightDiff = (
    goal: number,
    intercept: number,
    gradient: number
  ) => {
    // y = mx + c
    // weightDiff = m * deficit + c
    // (weightDiff - c) / m = deficit
    return (goal - intercept) / gradient;
  };

  const weeklyWeightDiffForDeficit = predictWeeklyWeightDiffForDeficit(
    getCombinedWeeklyValues(1),
    parseInt(deficit),
    ctx
  );

  return weeklyWeightDiffForDeficit;
};

export { predictService };
