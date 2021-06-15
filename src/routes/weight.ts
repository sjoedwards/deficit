import moment from "moment";
import {
  APIFitbitWeightData,
  FitbitDailyWeightData,
  FitbitMonthlyWeightData,
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
      getDatesForNMonthsAgo(6).map(async (baseDate: string) => {
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
  : T extends "monthly"
  ? FitbitMonthlyWeightData[]
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
    daily: (
      weight: Array<FitbitDailyWeightData>
    ): Array<FitbitDailyWeightData> => weight,
    weekly: async (
      weight: Array<FitbitDailyWeightData>
    ): Promise<Array<FitbitWeeklyWeightData>> => await getWeeklyWeight(weight),
    monthly: async (
      weight: Array<FitbitDailyWeightData>
    ): Promise<Array<FitbitMonthlyWeightData>> =>
      await getMonthlyWeight(weight),
  };

  const [, getWeightMethod] =
    Object.entries(resolutionsMap).find(([key]) => key === resolution) || [];
  if (!getWeightMethod) {
    ctx.throw(400, "Resolution not supported");
  }

  const weightData = (await getWeightMethod(weight)) as ResolutionType<T>;

  return weightData;
};

weightRouter.get("/weight/:resolution", async (ctx: Context) => {
  const resolution: ResolutionNames = ctx.params.resolution || "weekly";
  ctx.body = await weightService(resolution, ctx);
});

export { weightRouter };
