import { NextApiResponse } from "next";
import {
  FitbitWeeklyWeightData,
  IExtendedRequest,
  IPredictServiceOptions,
} from "./../../types/index";
import {
  ResolutionNames,
  DeficitGoalData,
  LinearRegressionInformation,
  PredictionData,
} from "../../types";

import { weightService } from "../weight";
import {
  linearRegression,
  linearRegressionLine,
  rSquared,
} from "simple-statistics";
import moment from "moment";
import { logWarning } from "../../tools/log-warning";
import {
  predictDeficitForRemainderOfMonth,
  predictDeficitForRemainderOfQuarter,
} from "./predict-deficit-for-remainder";
import { caloriesService } from "../calories";
import { addDataToState } from "./add-data-to-state";
import { getWeightWithDiff } from "./get-weight-with-diff";
import { getCombinedWeeklyValues } from "./get-combined-weekly-value";

export const predictWeightDiffForDeficit = (
  combinedValues: Array<DeficitGoalData>,
  deficit: number,
  request: IExtendedRequest,
  linearRegressionInformation: LinearRegressionInformation
): { rSquaredValue: number; weightDiff: number } => {
  const { rSquaredValue, regressionLine } = linearRegressionInformation || {};
  if (!rSquaredValue) {
    logWarning(
      `Determined RSquared value was falsey: ${rSquaredValue}`,
      request
    );
  }

  const weightDiff = regressionLine(deficit);

  if (!weightDiff) {
    logWarning(
      `Determined weightDiff value was falsey: ${rSquaredValue}`,
      request
    );
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
  request: IExtendedRequest,
  response: NextApiResponse,
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
    throw new Error("Resolution not supported");
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
      request,
      response,
      options
    );

    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);

    const weeklyWeightDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      request,
      linearRegressionInformation
    );

    const deficitForRemainingDaysThisMonth =
      await predictDeficitForRemainderOfMonth(
        request,
        response,
        linearRegressionInformation.gradient,
        linearRegressionInformation.intercept,
        goal
      );

    return {
      ...weeklyWeightDiffForDeficit,
      deficitForRemainingDaysThisMonth,
      goal,
    };
  }

  if (isQuarterly(resolution)) {
    const combinedValues = await getCombinedWeeklyValues(
      1,
      request,
      response,
      options
    );

    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);

    const weeklyWeightDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      request,
      linearRegressionInformation
    );

    const deficitForRemainingDaysThisQuarter =
      await predictDeficitForRemainderOfQuarter(
        request,
        response,
        linearRegressionInformation.gradient,
        linearRegressionInformation.intercept,
        goal
      );

    return {
      ...weeklyWeightDiffForDeficit,
      deficitForRemainingDaysThisQuarter,
      goal,
    };
  }

  if (isMonthly(resolution)) {
    const calories = await caloriesService(resolution, request, response);
    const weight = await weightService(resolution, request);
    addDataToState(request, calories, weight);

    const weightWithDiff = getWeightWithDiff(weight);

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
    const combinedValues = getCombinedMonthlyValues(0);
    const linearRegressionInformation =
      getLinearRegressionInformation(combinedValues);
    const monthlyDiffForDeficit = predictWeightDiffForDeficit(
      combinedValues,
      parseInt(deficit),
      request,
      linearRegressionInformation
    );

    return { ...monthlyDiffForDeficit, goal };
  }
};

export { predictService };
