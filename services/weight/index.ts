import {
  ResolutionNames,
  WeightResolutionType,
  FitbitDailyWeightData,
  FitbitWeeklyWeightData,
  FitbitMonthlyWeightData,
  IExtendedRequest,
  APIFitbitWeightData,
} from "./../../types";
import { cache } from "../../cache";
import { fitbitService } from "../fitbit";
import { endOfWeek, endOfMonth, format, getMonth, subMonths } from "date-fns";
import { filterDuplicates } from "../../tools/filter-duplicates";

const getWeight = async (
  request: IExtendedRequest
): Promise<Array<FitbitDailyWeightData>> => {
  const getDatesForNMonthsAgo = (monthsAgo: number) => {
    return Array.from({ length: monthsAgo }, (_, index) => {
      return format(subMonths(new Date(), index), "yyyy-MM-dd");
    }).reverse();
  };

  const weightResponse: Array<APIFitbitWeightData> = (
    await Promise.all(
      getDatesForNMonthsAgo(6).map(async (baseDate: string) =>
        fitbitService.getWeight(request, baseDate)
      )
    )
  )
    .reduce(
      // Flatten results into one array
      (acc: Array<APIFitbitWeightData>, month: Array<APIFitbitWeightData>) => {
        return acc.concat(month);
      },
      []
    )
    // remove duplicate dates
    .reduce((acc: Array<APIFitbitWeightData>, current: APIFitbitWeightData) => {
      const currentItemExists = acc.find(
        (item) => item.date === current.date && item.weight === current.weight
      );
      if (!currentItemExists) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

  return weightResponse.map(({ date, weight }) => {
    return {
      dateTime: date,
      weight: weight?.toString(),
    };
  });
};

export const getMonthlyWeight = async (
  apiWeight: Array<FitbitDailyWeightData>
): Promise<Array<FitbitMonthlyWeightData>> => {
  const monthlyWeight = apiWeight
    // Get unique weeks
    .map((entry) => getMonth(new Date(entry.dateTime)))
    .filter(filterDuplicates)
    // Nested array of entries for each week
    .map((month) =>
      apiWeight.filter((entry) => getMonth(new Date(entry.dateTime)) === month)
    )
    .map((monthlyWeight) => {
      return {
        // Reduce each week to a single value
        weight: (
          monthlyWeight.reduce(
            (sum: number, { weight }) => sum + parseFloat(`${weight}`),
            0
          ) / monthlyWeight.length
        ).toFixed(1),
        // Find the week end date from the first value
        monthEnd: (() => {
          return format(
            endOfMonth(new Date(Object.values(monthlyWeight)[0].dateTime)),
            "yyyy-MM-dd"
          );
        })(),
      };
    })
    .filter(
      (month) => month.monthEnd !== format(endOfMonth(new Date()), "yyyy-MM-dd")
    );
  return monthlyWeight;
};

export const getWeeklyWeight = async (
  apiWeight: Array<FitbitDailyWeightData>,
  decimalPlaces?: number
): Promise<Array<FitbitWeeklyWeightData>> => {
  const weeklyWeights = apiWeight.reduce<{
    [key: string]: FitbitDailyWeightData[];
  }>((acc, entry) => {
    const weekEnd = format(
      endOfWeek(new Date(entry.dateTime), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    const existingWeekInAcc = acc[weekEnd] || [];
    return {
      ...acc,
      [weekEnd]: [...existingWeekInAcc, { ...entry, weekEnd }],
    };
  }, {});
  const reducedWeeklyWeights = Object.values(weeklyWeights)
    .map((weeklyWeight) => {
      return {
        // Reduce each week to a single value
        weight: (() => {
          const weight =
            weeklyWeight.reduce(
              (sum: number, { weight }) => sum + parseFloat(`${weight}`),
              0
            ) / weeklyWeight.length;
          return decimalPlaces
            ? weight.toFixed(decimalPlaces)
            : weight.toString();
        })(),
        // Find the week end date from the last value
        weekEnd: (() => {
          return format(
            endOfWeek(
              new Date(
                Object.values(weeklyWeight)[weeklyWeight.length - 1].dateTime
              ),
              { weekStartsOn: 1 }
            ),
            "yyyy-MM-dd"
          );
        })(),
      };
    })
    .filter(
      (week) =>
        week.weekEnd !==
        format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
    );

  return reducedWeeklyWeights;
};

export const weightService = async <T extends ResolutionNames>(
  resolution: T,
  request: IExtendedRequest,
  decimalPlaces?: number
): Promise<WeightResolutionType<T>> => {
  let weight: Array<FitbitDailyWeightData>;
  const cachedWeight: Array<FitbitDailyWeightData> | undefined = cache.get(
    "weight",
    request
  );
  if (cachedWeight) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving weight from cache");
    weight = cachedWeight;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Getting weight from fitbit");
    weight = await getWeight(request);
    cache.set("weight", weight, request);
  }

  const resolutionsMap = {
    daily: (
      weight: Array<FitbitDailyWeightData>
    ): Array<FitbitDailyWeightData> => weight,
    weekly: async (
      weight: Array<FitbitDailyWeightData>
    ): Promise<Array<FitbitWeeklyWeightData>> =>
      await getWeeklyWeight(weight, decimalPlaces),
    monthly: async (
      weight: Array<FitbitDailyWeightData>
    ): Promise<Array<FitbitMonthlyWeightData>> =>
      await getMonthlyWeight(weight),
  };

  const [, getWeightMethod] =
    Object.entries(resolutionsMap).find(([key]) => key === resolution) || [];
  if (!getWeightMethod) {
    throw new Error("Resolution not supported");
  }

  const weightData = (await getWeightMethod(weight)) as WeightResolutionType<T>;

  return weightData;
};
