import { CalorieResolutionType, IExtendedRequest } from "./../../types/index";
import {
  ResolutionNames,
  FitbitData,
  FitbitDailyCaloriesData,
  FitbitWeeklyCaloriesData,
  FitbitMonthlyCaloriesData,
} from "../../types/index";

import { cache } from "../../cache";
import { fitbitService } from "../fitbit";
import { endOfWeek, endOfMonth, format, getMonth } from "date-fns";
import { filterDuplicates } from "../../tools/filter-duplicates";

export const getMonthlyCalories = async (
  apiCalories: Array<FitbitDailyCaloriesData>
): Promise<Array<FitbitMonthlyCaloriesData>> => {
  const monthlyCalories = apiCalories
    // Get unique months
    .map((entry) => getMonth(new Date(entry.dateTime)))
    .filter(filterDuplicates)
    // Nested array of entries for each month
    .map((month) =>
      apiCalories.filter(
        (entry) => getMonth(new Date(entry.dateTime)) === month
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
          return format(
            endOfMonth(new Date(Object.values(monthlyCalories)[0].dateTime)),
            "yyyy-MM-dd"
          );
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
      (month) => month.monthEnd !== format(endOfMonth(new Date()), "yyyy-MM-dd")
    );

  return monthlyCalories;
};

export const getCalories = async (
  request: IExtendedRequest
): Promise<Array<FitbitDailyCaloriesData>> => {
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

interface GetWeeklyCaloriesOptions {
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  excludeResultsFromThisWeek: boolean;
}

// Split into
export const getWeeklyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>,
  options: GetWeeklyCaloriesOptions = {
    weekStartsOn: 1,
    excludeResultsFromThisWeek: true,
  }
): Array<FitbitWeeklyCaloriesData> => {
  const { weekStartsOn, excludeResultsFromThisWeek } = options;
  const weeklyCalories = apiCalories.reduce<{
    [key: string]: FitbitDailyCaloriesData[];
  }>((acc, entry) => {
    const weekEnd = format(
      endOfWeek(new Date(entry.dateTime), {
        weekStartsOn,
      }),
      "yyyy-MM-dd"
    );
    const existingWeekInAcc = acc[weekEnd] || [];

    return {
      ...acc,
      [weekEnd]: [...existingWeekInAcc, { ...entry, weekEnd }],
    };
  }, {});
  const reducedWeeklyCalories = Object.values(weeklyCalories).map(
    (weeklyCalories) => {
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
          return format(
            endOfWeek(
              new Date(
                Object.values(weeklyCalories)[
                  weeklyCalories.length - 1
                ].dateTime
              ),
              {
                weekStartsOn,
              }
            ),
            "yyyy-MM-dd"
          );
        })(),
      };

      return {
        ...averageCalories,
        deficit: (
          parseInt(averageCalories.calories) -
          parseInt(averageCalories.activityCalories)
        ).toString(),
      };
    }
  );

  if (!excludeResultsFromThisWeek) {
    return reducedWeeklyCalories;
  }
  return reducedWeeklyCalories.filter(
    (week) =>
      week.weekEnd !==
      format(
        endOfWeek(new Date(), {
          weekStartsOn,
        }),
        "yyyy-MM-dd"
      )
  );
};

export const caloriesService = async <T extends ResolutionNames>(
  resolution: T,
  request: IExtendedRequest
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
    ): Promise<Array<FitbitWeeklyCaloriesData>> => getWeeklyCalories(calories),
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
