import {
  ResolutionNames,
  FitbitData,
  FitbitDailyCaloriesData,
  FitbitWeeklyCaloriesData,
  FitbitMonthlyCaloriesData,
} from "./../../../types/index";

import { Context } from "koa";
import axios from "axios";
import moment from "moment";
import { cache } from "../../cache";

const getMonthlyCalories = async (
  apiCalories: Array<FitbitDailyCaloriesData>
): Promise<Array<FitbitMonthlyCaloriesData>> => {
  const monthlyCalories = apiCalories
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
    .map((monthlyCalories) => {
      const averageCalories = {
        // Reduce each month to a single value
        calories: (
          monthlyCalories.reduce(
            (sum: number, { calories }) => sum + parseInt(`${calories}`, 10),
            0
          ) / monthlyCalories.length
        ).toFixed(0),
        // Reduce each month to a single value
        activityCalories: (
          monthlyCalories.reduce(
            (sum: number, { activityCalories }) =>
              sum + parseInt(`${activityCalories}`, 10),
            0
          ) / monthlyCalories.length
        ).toFixed(0),
        // Find the month end date from the first value
        monthEnd: (() => {
          return moment(Object.values(monthlyCalories)[0].dateTime)
            .endOf("month")
            .format("YYYY-MM-DD");
        })(),
      };

      return {
        ...averageCalories,
        deficit: (
          parseInt(averageCalories.calories) -
          parseInt(averageCalories.activityCalories)
        ).toString(),
      };
    })
    // Filter results from this month
    .filter(
      (month) =>
        month.monthEnd !==
        moment().locale("en-gb").endOf("month").format("YYYY-MM-DD")
    );

  return monthlyCalories;
};

export const getCalories = async (
  ctx: Context
): Promise<Array<FitbitDailyCaloriesData>> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
  const caloriesResponse: Array<FitbitData> = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/6m.json`,
      method: "get",
      headers,
    })
  ).data["foods-log-caloriesIn"].filter(
    ({ value }: FitbitData) => parseInt(value) !== 0
  );

  const activityCaloriesResponse: Array<FitbitData> = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/activities/calories/date/today/6m.json`,
      method: "get",
      headers,
    })
  ).data["activities-calories"].filter(
    ({ value }: FitbitData) => parseInt(value) !== 0
  );

  const calories = activityCaloriesResponse.map(
    ({ dateTime, value: activityCalories }) => {
      // Find the caloriesResponse entry for the dateTime
      const caloriesIn =
        caloriesResponse.find((entry) => entry.dateTime === dateTime)?.value ||
        "0";
      return {
        dateTime,
        calories: caloriesIn || "0",
        activityCalories: activityCalories,
        deficit: (parseInt(caloriesIn) - parseInt(activityCalories)).toString(),
      };
    }
  );

  return calories;
};

const getWeeklyCalories = async (
  apiCalories: Array<FitbitDailyCaloriesData>
): Promise<Array<FitbitWeeklyCaloriesData>> => {
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
      const averageCalories = {
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

      return {
        ...averageCalories,
        deficit: (
          parseInt(averageCalories.calories) -
          parseInt(averageCalories.activityCalories)
        ).toString(),
      };
    })
    // Filter results from this week
    .filter(
      (week) =>
        week.weekEnd !==
        moment().locale("en-gb").endOf("isoWeek").format("YYYY-MM-DD")
    );

  return weeklyCalories;
};

type ResolutionType<T> = T extends "daily"
  ? FitbitDailyCaloriesData[]
  : T extends "weekly"
  ? FitbitWeeklyCaloriesData[]
  : T extends "monthly"
  ? FitbitMonthlyCaloriesData[]
  : never;

export const caloriesService = async <T extends ResolutionNames>(
  resolution: T,
  ctx: Context
): Promise<ResolutionType<T>> => {
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

  const resolutionsMap = {
    daily: (
      calories: Array<FitbitDailyCaloriesData>
    ): Array<FitbitDailyCaloriesData> => calories,
    weekly: async (
      calories: Array<FitbitDailyCaloriesData>
    ): Promise<Array<FitbitWeeklyCaloriesData>> =>
      await getWeeklyCalories(calories),
    monthly: async (
      calories: Array<FitbitDailyCaloriesData>
    ): Promise<Array<FitbitMonthlyCaloriesData>> =>
      await getMonthlyCalories(calories),
  };

  // Fix these types
  const [, getCaloriesMethod] =
    Object.entries(resolutionsMap).find(([key]) => key === resolution) || [];

  if (!getCaloriesMethod) {
    ctx.throw(400, "Resolution not supported");
  }

  const caloriesData = (await getCaloriesMethod(calories)) as ResolutionType<T>;

  return caloriesData;
};
