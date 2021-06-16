import {
  ResolutionNames,
  DeficitGoalData,
  LinearRegressionInformation,
  PredictionData,
  FitbitWeeklyWeightData,
} from "./../../../types/index";

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
import { simpleMovingWeightAverage } from "../../test/tools/simple-moving-weight-average";

export const predictWeightDiffForDeficit = (
  combinedValues: Array<DeficitGoalData>,
  deficit: number,
  ctx: Context
): PredictionData => {
  const { rSquaredValue, regressionLine } = getLinearRegressionInformation(
    combinedValues
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

interface IPredictServiceOptions {
  weightDiffMovingAverage: number;
}

const predictService = async (
  ctx: Context,
  deficit: string,
  resolution: ResolutionNames,
  options?: IPredictServiceOptions
): Promise<PredictionData> => {
  if (resolution !== "weekly" && resolution !== "monthly") {
    return ctx.throw(400, "resolution not supported");
  }

  const isWeekly = (resolution: ResolutionNames): resolution is "weekly" => {
    return resolution === "weekly";
  };

  const isMonthly = (resolution: ResolutionNames): resolution is "monthly" => {
    return resolution === "monthly";
  };

  if (isWeekly(resolution)) {
    const calories = await caloriesService(resolution, ctx);
    const weight = await weightService(resolution, ctx);
    ctx.state.data = {
      ...ctx.state.data,
      calories,
      weight,
    };

    const weightWithDiff: FitbitWeeklyWeightData[] = weight
      .map((value, index) => {
        const previousValueWeight = parseFloat(weight[index - 1]?.weight);
        return {
          ...value,
          weightDiff:
            previousValueWeight &&
            (parseFloat(value.weight) - previousValueWeight)?.toString(),
        };
      })
      .filter(({ weightDiff }) => weightDiff);

    const simpleWeightMovingAverage =
      options?.weightDiffMovingAverage &&
      simpleMovingWeightAverage(
        weightWithDiff,
        options?.weightDiffMovingAverage
      );

    const getCombinedWeeklyValues = (deficitWeeksAgo: number) =>
      (simpleWeightMovingAverage || weightWithDiff)
        .map(({ weekEnd, weightDiff }) => {
          // Find the caloriesResponse entry for the dateTime
          const deficit = calories.find(
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

    const weeklyWeightDiffForDeficit = predictWeightDiffForDeficit(
      getCombinedWeeklyValues(1),
      parseInt(deficit),
      ctx
    );

    return weeklyWeightDiffForDeficit;
  }

  if (isMonthly(resolution)) {
    const calories = await caloriesService(resolution, ctx);
    const weight = await weightService(resolution, ctx);
    ctx.state.data = {
      ...ctx.state.data,
      calories,
      weight,
    };

    const weightWithDiff = weight
      .map((value, index) => {
        const previousValueWeight = parseFloat(weight[index - 1]?.weight);
        return {
          ...value,
          weightDiff:
            previousValueWeight &&
            (parseFloat(value.weight) - previousValueWeight)?.toString(),
        };
      })
      .filter(({ weightDiff }) => weightDiff);

    const getCombinedMonthlyValues = (deficitWeeksAgo: number) =>
      weightWithDiff
        .map(({ monthEnd, weightDiff }) => {
          // Find the caloriesResponse entry for the dateTime
          const deficit = calories.find(
            (entry) =>
              entry.monthEnd ===
              moment(monthEnd)
                .subtract(deficitWeeksAgo, "month")
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

    const monthlyDiffForDeficit = predictWeightDiffForDeficit(
      getCombinedMonthlyValues(0),
      parseInt(deficit),
      ctx
    );

    return monthlyDiffForDeficit;
  }
};

export { predictService };
