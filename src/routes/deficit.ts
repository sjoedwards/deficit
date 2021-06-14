import { FitbitDailyCaloriesData } from "./../../types/index";
import { getCalories } from "./calories";

import { Context } from "koa";
import moment from "moment";
import Router from "@koa/router";
import { cache } from "../cache";
import { predictService } from "../services/predict";

const deficitRouter = new Router();

const getMonthlyCalories = (apiCalories: Array<FitbitDailyCaloriesData>) => {
  return (
    apiCalories
      // Get unique months
      .map((entry) => {
        return moment(entry.dateTime).locale("en-gb").month();
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      // Nested array of entries for each month
      .map((month) =>
        apiCalories.filter(
          (entry) => moment(entry.dateTime).locale("en-gb").month() === month
        )
      )
  );
};

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
  const monthlyCalories = getMonthlyCalories(calories);
  const caloriesCurrentMonth = monthlyCalories[monthlyCalories.length - 1];
  const deficitsCurrentMonth = caloriesCurrentMonth.map(
    ({ dateTime, deficit }) => ({ dateTime, deficit })
  );
  const averageDeficitCurrentMonth = getAverageDeficit(caloriesCurrentMonth);

  const { weightDiff, rSquaredValue } =
    (await predictService(ctx, averageDeficitCurrentMonth, "weekly")) || {};
  const weightDiffFixed = weightDiff.toFixed(3);

  ctx.body = {
    message: `At your daily deficit of ${averageDeficitCurrentMonth} calories (averaged over days this month), you are predicted to ${
      weightDiff >= 0 ? "gain" : "lose"
    } ${Math.abs(
      parseFloat(weightDiffFixed)
    )} kilograms per week, based off of your historic metabolic data`,
    averageDeficitCurrentMonth,
    // TODO replace with frontend functionality
    predictedWeeklyWeightDiff: {
      weightDiffKilos: weightDiffFixed,
      rSquaredValue: rSquaredValue.toFixed(3),
    },
    deficits: deficitsCurrentMonth,
  };
});

export { deficitRouter };
