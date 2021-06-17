import { FitbitDailyCaloriesData } from "./../../types/index";
import { getCalories } from "../services/calories";
import { Context } from "koa";
import Router from "@koa/router";
import { cache } from "../cache";
import { predictService } from "../services/predict";
import { groupIntoMonthlyCalories } from "../tools/group-into-monthly-calories";

const deficitRouter = new Router();

const getAverageDeficit = (calories: Array<FitbitDailyCaloriesData>) =>
  (
    calories.reduce(
      (sum: number, { deficit }) => sum + parseInt(`${deficit}`, 10),
      0
    ) / calories.length
  ).toFixed(0);

deficitRouter.get("/deficit", async (ctx: Context) => {
  let calories: Array<FitbitDailyCaloriesData>;
  const cachedCalories: Array<FitbitDailyCaloriesData> = cache.get(
    "calories",
    ctx
  );
  if (cachedCalories) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving calories from cache");
    calories = cachedCalories;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Getting calories from fitbit");
    calories = await getCalories(ctx);
    cache.set("calories", calories, ctx);
  }
  const monthlyCalories = groupIntoMonthlyCalories(calories);
  const caloriesCurrentMonth = monthlyCalories[monthlyCalories.length - 1];
  const deficitsCurrentMonth = caloriesCurrentMonth.map(
    ({ dateTime, deficit }) => ({ dateTime, deficit })
  );
  const averageDeficitCurrentMonth = getAverageDeficit(caloriesCurrentMonth);

  const goal = -0.25;

  const { weightDiff, rSquaredValue, deficitForRemainingDaysThisMonth } =
    (await predictService(ctx, averageDeficitCurrentMonth, "weekly", goal)) ||
    {};
  const {
    weightDiff: weightDiff3Point,
    rSquaredValue: rSquaredValue3Point,
    deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed3Point,
  } =
    (await predictService(ctx, averageDeficitCurrentMonth, "weekly", goal, {
      weightDiffMovingAverage: 3,
    })) || {};
  const {
    weightDiff: weightDiff5Point,
    rSquaredValue: rSquaredValue5Point,
    deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed5Point,
  } =
    (await predictService(ctx, averageDeficitCurrentMonth, "weekly", goal, {
      weightDiffMovingAverage: 5,
    })) || {};
  const weightDiffFixed = weightDiff.toFixed(3);
  const deficitForRemainingDaysThisMonthFixed = deficitForRemainingDaysThisMonth.toFixed(
    0
  );

  ctx.body = {
    message: `At your daily deficit of ${averageDeficitCurrentMonth} calories (averaged over days this month), you are predicted to ${
      weightDiff >= 0 ? "gain" : "lose"
    } ${Math.abs(
      parseFloat(weightDiffFixed)
    )} kilograms per week, based off of your historic metabolic data. You need to average ${deficitForRemainingDaysThisMonthFixed} calories a day for the rest of the month.`,
    averageDeficitCurrentMonth,
    // TODO replace with frontend functionality
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        weightDiffKilos: weightDiffFixed,
        rSquaredValue: rSquaredValue.toFixed(3),
        deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed,
      },
      threePointMoving: {
        weightDiffKilos: weightDiff3Point.toFixed(3),
        rSquaredValue: rSquaredValue3Point.toFixed(3),
        deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed3Point.toFixed(
          0
        ),
      },
      fivePointMoving: {
        weightDiffKilos: weightDiff5Point.toFixed(3),
        rSquaredValue: rSquaredValue5Point.toFixed(3),
        deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed5Point.toFixed(
          0
        ),
      },
    },
    deficits: deficitsCurrentMonth,
  };
});

export { deficitRouter };
