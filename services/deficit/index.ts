import { getCalories } from "../calories";
import { IExtendedRequest, FitbitDailyCaloriesData } from "../../types/index";
import { NextApiResponse } from "next";
import { cache } from "../../cache";
import { groupIntoMonthlyCalories } from "../../tools/group-into-monthly-calories";
import { predictService } from "../predict";
const getAverageDeficit = (calories: Array<FitbitDailyCaloriesData>) =>
  (
    calories.reduce(
      (sum: number, { deficit }) => sum + parseInt(`${deficit}`, 10),
      0
    ) / calories.length
  ).toFixed(0);

const deficitService = async (
  request: IExtendedRequest,
  response: NextApiResponse
) => {
  let calories: Array<FitbitDailyCaloriesData>;
  const cachedCalories: Array<FitbitDailyCaloriesData> | undefined = cache.get(
    "calories",
    request
  );
  if (cachedCalories) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving calories from cache");
    calories = cachedCalories;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Getting calories from fitbit");
    calories = await getCalories(request);
    cache.set("calories", calories, request);
  }
  const monthlyCalories = groupIntoMonthlyCalories(calories);

  const caloriesCurrentMonth = monthlyCalories[monthlyCalories.length - 1];
  const deficitsCurrentMonth = caloriesCurrentMonth.map(
    ({ dateTime, deficit }) => ({ dateTime, deficit })
  );
  const averageDeficitCurrentMonth = getAverageDeficit(caloriesCurrentMonth);

  const goal = -0.25;

  const { weightDiff, rSquaredValue, deficitForRemainingDaysThisMonth } =
    (await predictService(
      request,
      response,
      averageDeficitCurrentMonth,
      "weekly",
      goal
    )) || {};
  const {
    weightDiff: weightDiff3Point,
    rSquaredValue: rSquaredValue3Point,
    deficitForRemainingDaysThisMonth:
      deficitForRemainingDaysThisMonthFixed3Point,
  } = (await predictService(
    request,
    response,
    averageDeficitCurrentMonth,
    "weekly",
    goal,
    {
      weightDiffMovingAverage: 3,
    }
  )) || {};
  const {
    weightDiff: weightDiff5Point,
    rSquaredValue: rSquaredValue5Point,
    deficitForRemainingDaysThisMonth:
      deficitForRemainingDaysThisMonthFixed5Point,
  } = (await predictService(
    request,
    response,
    averageDeficitCurrentMonth,
    "weekly",
    goal,
    {
      weightDiffMovingAverage: 5,
    }
  )) || {};
  const weightDiffFixed = weightDiff && weightDiff.toFixed(3);
  const deficitForRemainingDaysThisMonthFixed =
    deficitForRemainingDaysThisMonth &&
    deficitForRemainingDaysThisMonth.toFixed(0);

  return {
    averageDeficitCurrentMonth,
    // TODO replace with frontend functionality
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        weightDiffKilos: weightDiffFixed,
        rSquaredValue: rSquaredValue && rSquaredValue.toFixed(3),
        deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed,
      },
      threePointMoving: {
        weightDiffKilos: weightDiff3Point && weightDiff3Point.toFixed(3),
        rSquaredValue: rSquaredValue3Point && rSquaredValue3Point.toFixed(3),
        deficitForRemainingDaysThisMonth:
          deficitForRemainingDaysThisMonthFixed3Point &&
          deficitForRemainingDaysThisMonthFixed3Point.toFixed(0),
      },
      fivePointMoving: {
        weightDiffKilos: weightDiff5Point && weightDiff5Point.toFixed(3),
        rSquaredValue: rSquaredValue5Point && rSquaredValue5Point.toFixed(3),
        deficitForRemainingDaysThisMonth:
          deficitForRemainingDaysThisMonthFixed5Point &&
          deficitForRemainingDaysThisMonthFixed5Point.toFixed(0),
      },
    },
    deficits: deficitsCurrentMonth,
  };
};

export { deficitService };
