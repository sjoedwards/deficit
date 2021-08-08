import axios from "axios";
import moment from "moment";
import {
  ResolutionNames,
  WeightResolutionType,
  FitbitDailyWeightData,
  FitbitWeeklyWeightData,
  FitbitMonthlyWeightData,
  IExtendedRequest,
  APIFitbitWeightData,
} from "./../../types/index";
import { cache } from "../../cache";
import { fitbitService } from "../fitbit";

const getWeight = async (
  request: IExtendedRequest
): Promise<Array<FitbitDailyWeightData>> => {
  const getDatesForNMonthsAgo = (monthsAgo: number) => {
    return Array.from({ length: monthsAgo }, (_, index) => {
      return moment()
        .subtract(index, "months")
        .locale("en-gb")
        .format("YYYY-MM-DD");
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

const getMonthlyWeight = async (
  apiWeight: Array<FitbitDailyWeightData>
): Promise<Array<FitbitMonthlyWeightData>> => {
  const monthlyWeight = apiWeight
    // Get unique weeks
    .map((entry) => {
      return moment(entry.dateTime).locale("en-gb").month();
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    // Nested array of entries for each week
    .map((month) =>
      apiWeight.filter(
        (entry) => moment(entry.dateTime).locale("en-gb").month() === month
      )
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
          return moment(Object.values(monthlyWeight)[0].dateTime)
            .endOf("month")
            .format("YYYY-MM-DD");
        })(),
      };
    })
    .filter(
      (month) =>
        month.monthEnd !==
        moment().locale("en-gb").endOf("month").format("YYYY-MM-DD")
    );
  return monthlyWeight;
};

const getWeeklyWeight = async (
  apiWeight: Array<FitbitDailyWeightData>,
  decimalPlaces?: number
): Promise<Array<FitbitWeeklyWeightData>> => {
  const weeklyWeight = apiWeight
    // Get unique weeks
    .map((entry) => {
      return moment(entry.dateTime).locale("en-gb").week();
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    // Nested array of entries for each week
    .map((week) =>
      apiWeight.filter(
        (entry) => moment(entry.dateTime).locale("en-gb").week() === week
      )
    )
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
        // Find the week end date from the first value
        weekEnd: (() => {
          return moment(Object.values(weeklyWeight)[0].dateTime)
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

  return weeklyWeight;
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
