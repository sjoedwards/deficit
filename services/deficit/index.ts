import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  IDeficitServiceResponse,
} from "../../types/index";
import { groupIntoMonthlyCalories } from "../../tools/group-into-monthly-calories";
import { predictService } from "../predict";
import { groupIntoQuarterlyCalories } from "../../tools/get-calories-current-quarter";
import AnnualWeightPredictionService from "../annualWeightPrediction/AnnualWeightPrediction";
const getAverageDeficit = (calories: Array<FitbitDailyCaloriesData>) => {
  const caloriesTotal = calories.reduce(
    (sum: number, { deficit }) => sum + parseInt(`${deficit}`, 10),
    0
  );
  return (caloriesTotal / calories.length).toFixed(0);
};

const deficitService = async (
  weights: Array<FitbitDailyWeightData>,
  calories: Array<FitbitDailyCaloriesData>
): Promise<IDeficitServiceResponse> => {
  console.log("year 2", new Date().getFullYear());
  const caloriesCurrentQuarter = groupIntoQuarterlyCalories(calories);

  const averageDeficitCurrentQuarter = getAverageDeficit(
    caloriesCurrentQuarter
  );

  const monthlyCalories = groupIntoMonthlyCalories(calories);

  const caloriesCurrentMonth = monthlyCalories[monthlyCalories.length - 1];
  const deficitsCurrentMonth = caloriesCurrentMonth.map(
    ({ dateTime, deficit }) => ({ dateTime, deficit })
  );
  const averageDeficitCurrentMonth = getAverageDeficit(caloriesCurrentMonth);

  const goal = -0.25;
  console.log("year 2.5", new Date().getFullYear());

  const {
    combinedValues,
    weightDiff,
    rSquaredValue,
    deficitForRemainingDaysThisMonth,
  } =
    (await predictService(
      weights,
      calories,
      averageDeficitCurrentMonth,
      "weekly",
      goal
    )) || {};
  const {
    combinedValues: combinedValues3Point,
    weightDiff: weightDiff3Point,
    rSquaredValue: rSquaredValue3Point,
    deficitForRemainingDaysThisMonth:
    deficitForRemainingDaysThisMonthFixed3Point,
  } = (await predictService(
    weights,
    calories,
    averageDeficitCurrentMonth,
    "weekly",
    goal,
    {
      weightDiffMovingAverage: 3,
    }
  )) || {};

  console.log("year 2.75", new Date().getFullYear());

  const {
    combinedValues: combinedValues5Point,
    weightDiff: weightDiff5Point,
    rSquaredValue: rSquaredValue5Point,
    deficitForRemainingDaysThisMonth:
    deficitForRemainingDaysThisMonthFixed5Point,
  } = (await predictService(
    weights,
    calories,
    averageDeficitCurrentMonth,
    "weekly",
    goal,
    {
      weightDiffMovingAverage: 5,
    }
  )) || {};

  console.log("year 2.8", new Date().getFullYear());

  // const {
  //   combinedValues: combinedValuesQuarter,
  //   weightDiff: weightDiffQuarter,
  //   deficitForRemainingDaysThisQuarter,
  // } = (await predictService(
  //   weights,
  //   calories,
  //   averageDeficitCurrentQuarter,
  //   "quarterly",
  //   goal
  // )) || {};

  const {
    combinedValues: combinedValuesQuarter,
    weightDiff: weightDiffQuarter,
    deficitForRemainingDaysThisQuarter,
  } = {
    combinedValues: 0,
    weightDiff: 0,
    deficitForRemainingDaysThisQuarter: 0,
  };

  console.log("year 2.9", new Date().getFullYear());

  const weightDiffFixed = weightDiff && weightDiff.toFixed(3);
  const deficitForRemainingDaysThisMonthFixed =
    deficitForRemainingDaysThisMonth &&
    deficitForRemainingDaysThisMonth.toFixed(0);
  const weightDiffQuarterFixed = weightDiffQuarter?.toFixed(3);
  const deficitForRemainingDaysThisQuarterFixed =
    deficitForRemainingDaysThisQuarter?.toFixed(0);
  console.log("year 3", new Date().getFullYear());

  // New Annual Engine
  const annualWeightPredictionService = new AnnualWeightPredictionService(
    calories,
    weights
  );

  const annualWeightPredictionCurrentMonth =
    annualWeightPredictionService.predictWeightDiffUsingAnnualData(
      parseInt(averageDeficitCurrentMonth)
    );

  const annualWeightPredictionCurrentQuarter =
    annualWeightPredictionService.predictWeightDiffUsingAnnualData(
      parseInt(averageDeficitCurrentQuarter)
    );

  return {
    averageDeficitCurrentMonth,
    // TODO replace with frontend functionality
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        weightDiffKilos: weightDiffFixed,
        rSquaredValue: rSquaredValue && rSquaredValue.toFixed(3),
        deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed,
        combinedValues,
      },
      threePointMoving: {
        weightDiffKilos: weightDiff3Point && weightDiff3Point.toFixed(3),
        rSquaredValue: rSquaredValue3Point && rSquaredValue3Point.toFixed(3),
        deficitForRemainingDaysThisMonth:
          deficitForRemainingDaysThisMonthFixed3Point &&
          deficitForRemainingDaysThisMonthFixed3Point.toFixed(0),
        combinedValues,
      },
      fivePointMoving: {
        weightDiffKilos: weightDiff5Point && weightDiff5Point.toFixed(3),
        rSquaredValue: rSquaredValue5Point && rSquaredValue5Point.toFixed(3),
        deficitForRemainingDaysThisMonth:
          deficitForRemainingDaysThisMonthFixed5Point &&
          deficitForRemainingDaysThisMonthFixed5Point.toFixed(0),
        combinedValues,
      },
    },
    deficits: deficitsCurrentMonth,
    currentQuarter: {
      averageDeficitCurrentQuarter,
      predictedWeeklyWeightDiff: {
        noMovingAverage: {
          weightDiffKilos: weightDiffQuarterFixed,
          rSquaredValue: rSquaredValue && rSquaredValue.toFixed(3),
          deficitForRemainingDaysThisQuarter:
            deficitForRemainingDaysThisQuarterFixed,
          combinedValues,
        },
      },
    },
    annualEngine: {
      prediction: {
        currentMonth: annualWeightPredictionCurrentMonth,
        currentQuarter: annualWeightPredictionCurrentQuarter,
      },
    },
  };
};

export { deficitService };
