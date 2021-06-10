import moment from "moment";
import {
  APIFitbitCaloriesData,
  APIFitbitWeightData,
  FitbitDailyWeightData,
  FitbitWeeklyWeightData,
  ResolutionNames,
} from "./../../types/index";
import { Context } from "koa";
import axios from "axios";
import Router from "@koa/router";
import { cache } from "../cache";

const weightRouter = new Router();

const getWeight = async (
  ctx: Context
): Promise<Array<FitbitDailyWeightData>> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
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
      getDatesForNMonthsAgo(3).map(async (baseDate: string) => {
        return (
          await axios({
            url: `https://api.fitbit.com/1/user/-/body/log/weight/date/${baseDate}/1m.json`,
            method: "get",
            headers,
          })
        )?.data?.weight;
      })
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

const getWeeklyWeight = async (
  apiWeight: Array<FitbitDailyWeightData>
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
        weight: (
          weeklyWeight.reduce(
            (sum: number, { weight }) => sum + parseFloat(`${weight}`),
            0
          ) / weeklyWeight.length
        ).toFixed(1),
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

type ResolutionType<T> = T extends "daily"
  ? FitbitDailyWeightData[]
  : T extends "weekly"
  ? FitbitWeeklyWeightData[]
  : never;

export const weightService = async <T extends ResolutionNames>(
  resolution: T,
  ctx: Context
): Promise<ResolutionType<T>> => {
  let weight: Array<FitbitDailyWeightData>;
  const cachedWeight: Array<FitbitDailyWeightData> = cache.get("weight", ctx);
  if (cachedWeight) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving weight from cache");
    weight = cachedWeight;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Getting weight from fitbit");
    weight = await getWeight(ctx);
    cache.set("weight", weight, ctx);
  }
  const resolutionsMap = {
    weekly: async (
      weight: Array<FitbitDailyWeightData>
    ): Promise<Array<FitbitWeeklyWeightData>> => await getWeeklyWeight(weight),
    daily: (
      weight: Array<FitbitDailyWeightData>
    ): Array<FitbitDailyWeightData> => weight,
  };

  const [, getWeightMethod] = Object.entries(resolutionsMap).find(
    ([key]) => key === resolution
  );
  const weightData = (await getWeightMethod(weight)) as ResolutionType<T>;

  return weightData;
};

weightRouter.get("/weight/:resolution", async (ctx: Context) => {
  const resolution: ResolutionNames = ctx.params.resolution || "weekly";
  ctx.body = await weightService(resolution, ctx);
});

export { weightRouter };
