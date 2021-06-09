import { APIFitbitCaloriesData } from "./../../types/index";
import { getCalories } from "./calories";

import { Context } from "koa";
import moment from "moment";
import Router from "@koa/router";
import { cache } from "../cache";

const deficitRouter = new Router();

const getMonthlyCalories = (apiCalories: Array<APIFitbitCaloriesData>) => {
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

const getAverageDeficit = (calories: Array<APIFitbitCaloriesData>) =>
  (
    calories.reduce(
      (sum: number, { deficit }) => sum + parseInt(`${deficit}`, 10),
      0
    ) / calories.length
  ).toFixed(0);

deficitRouter.get("/deficit", async (ctx: Context) => {
  let calories: Array<APIFitbitCaloriesData>;
  const cachedCalories: Array<APIFitbitCaloriesData> = cache.get(
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
  const averageCaloriesForCurrentMonth = getAverageDeficit(
    caloriesCurrentMonth
  );

  ctx.body = {
    averageDeficitCurrentMonth: averageCaloriesForCurrentMonth,
    // TODO replace with frontend functionality
    goals: { "0": "-851", "0.25": "-1301", "0.5": "-1751" },
    deficits: deficitsCurrentMonth,
  };
});

export { deficitRouter };
