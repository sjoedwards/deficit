import {
  APIFitbitCaloriesData,
  FitbitData,
  FitbitCaloriesData,
} from "../../types";

import { Context } from "koa";
import axios from "axios";
import moment from "moment";
import Router from "@koa/router";
import { cache } from "../cache";

const caloriesRouter = new Router();

export const getCalories = async (
  ctx: Context
): Promise<Array<APIFitbitCaloriesData>> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
  const caloriesResponse: Array<FitbitData> = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/3m.json`,
      method: "get",
      headers,
    })
  ).data["foods-log-caloriesIn"].filter(
    ({ value }: FitbitData) => parseInt(value) !== 0
  );

  const activityCaloriesResponse: Array<FitbitData> = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/activities/calories/date/today/3m.json`,
      method: "get",
      headers,
    })
  ).data["activities-calories"].filter(
    ({ value }: FitbitData) => parseInt(value) !== 0
  );

  const calories = caloriesResponse.map(({ dateTime, value: calories }) => {
    // Find the activityCaloriesResponse entry for the dateTime
    const { value: activityCalories } = activityCaloriesResponse.find(
      (entry) => entry.dateTime === dateTime
    );
    return {
      dateTime,
      calories,
      activityCalories: activityCalories,
      deficit: (parseInt(calories) - parseInt(activityCalories)).toString(),
    };
  });

  return calories;
};

const getWeeklyCalories = async (
  apiCalories: Array<APIFitbitCaloriesData>
): Promise<Array<FitbitCaloriesData>> => {
  const weeklyCalories = apiCalories
    // Get unique weeks
    .map((entry) => {
      return moment(entry.dateTime).locale("en-gb").week();
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    // Nested array of entries for each week
    .map((week) =>
      apiCalories.filter(
        (entry) => moment(entry.dateTime).locale("en-gb").week() === week
      )
    )
    .map((weeklyCalories) => {
      return {
        // Reduce each week to a single value
        calories: (
          weeklyCalories.reduce(
            (sum: number, { calories }) => sum + parseInt(`${calories}`, 10),
            0
          ) / weeklyCalories.length
        ).toFixed(0),
        // Reduce each week to a single value
        activityCalories: (
          weeklyCalories.reduce(
            (sum: number, { activityCalories }) =>
              sum + parseInt(`${activityCalories}`, 10),
            0
          ) / weeklyCalories.length
        ).toFixed(0),
        // Find the week end date from the first value
        weekEnd: (() => {
          return moment(Object.values(weeklyCalories)[0].dateTime)
            .endOf("isoWeek")
            .format("YYYY-MM-DD");
        })(),
      };
    })
    .filter(
      (week) =>
        week.weekEnd !==
        moment().locale("en-gb").endOf("isoWeek").format("YYYY-MM-DD")
    );

  return weeklyCalories;
};

caloriesRouter.get("/calories/:resolution", async (ctx: Context) => {
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

  const resolution: string = ctx.params.resolution || "weekly";

  const resolutionsMap = {
    weekly: async (calories: Array<APIFitbitCaloriesData>) =>
      await getWeeklyCalories(calories),
    daily: async (calories: Array<APIFitbitCaloriesData>) => calories,
  };

  const [, getCaloriesMethod] = Object.entries(resolutionsMap).find(
    ([key]) => key === resolution
  );

  const caloriesData = await getCaloriesMethod(calories);

  ctx.body = caloriesData;
});

export { caloriesRouter };
