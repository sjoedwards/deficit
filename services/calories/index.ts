import { NextApiResponse } from "next";
import { CalorieResolutionType, IExtendedRequest } from "./../../types/index";
import {
  ResolutionNames,
  FitbitData,
  FitbitDailyCaloriesData,
  FitbitWeeklyCaloriesData,
  FitbitMonthlyCaloriesData,
} from "../../types/index";

import moment from "moment";
import { cache } from "../../cache";
import { fitbitService } from "../fitbit";

export const getMonthlyCalories = async (
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
  request: IExtendedRequest
): Promise<Array<FitbitDailyCaloriesData>> => {
  const headers = {
    Authorization: `Bearer ${request?.state?.token}`,
  };
  const caloriesResponse: Array<FitbitData> = await fitbitService.getCaloriesIn(
    request
  );

  const activityCaloriesResponse: Array<FitbitData> =
    await fitbitService.getActivityCalories(request);

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

export const getWeeklyCalories = async (
  apiCalories: Array<FitbitDailyCaloriesData>
): Promise<Array<FitbitWeeklyCaloriesData>> => {
  const weeklyCalories = apiCalories
    // Get unique weeks
    .map((entry) => {
      return moment(entry.dateTime).locale("en-gb").week();
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    // Nested array of entries for each week
    .map((week) => {
      const caloriesForWeek = apiCalories.filter(
        (entry) => moment(entry.dateTime).locale("en-gb").week() === week
      );
      return caloriesForWeek;
    })
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

export const caloriesService = async <T extends ResolutionNames>(
  resolution: T,
  request: IExtendedRequest,
  response: NextApiResponse
): Promise<CalorieResolutionType<T>> => {
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
    quarterly: async (
      calories: Array<FitbitDailyCaloriesData>
    ): Promise<Array<FitbitMonthlyCaloriesData>> =>
      await getMonthlyCalories(calories),
  };

  // Fix these types - see https://stackoverflow.com/questions/57350092/string-cant-be-used-to-index-type
  const [, getCaloriesMethod] =
    Object.entries(resolutionsMap).find(([key]) => key === resolution) || [];

  if (!getCaloriesMethod) {
    throw new Error("Resolution not supported");
  }

  const caloriesData = (await getCaloriesMethod(
    calories
  )) as CalorieResolutionType<T>;

  return caloriesData;
};
