import { FitbitMacrosData } from "./../../types/index";
import { Context } from "koa";
import axios from "axios";
import moment from "moment";
import Router from "@koa/router";
import { cache } from "../cache";

const macrosRouter = new Router();

const getMacros = async (
  ctx: Context,
  weeksAgo: number
): Promise<FitbitMacrosData> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
  const weekStart = moment()
    .subtract(weeksAgo, "weeks")
    .startOf("isoWeek")
    .format("YYYY-MM-DD");
  const weekEnd = moment()
    .subtract(weeksAgo, "weeks")
    .endOf("isoWeek")
    .format("YYYY-MM-DD");
  const macros = await Promise.all(
    Array(7)
      .fill(undefined)
      .map(async (_, index) => {
        const date = moment(weekStart).add(index, "days").format("YYYY-MM-DD");
        const macrosResult = (
          await axios({
            url: `https://api.fitbit.com/1/user/-/foods/log/date/${date}.json`,
            method: "get",
            headers,
          })
        ).data.summary;
        const { calories, protein, carbs, fat } = macrosResult;
        return {
          date,
          calories,
          protein,
          carbs,
          fat,
        };
      })
  );
  const weekMacros = macros.reduce(
    (acc, entry) => {
      return {
        calories: acc.calories + parseFloat(entry.calories),
        fat: acc.fat + parseFloat(entry.fat),
        protein: acc.protein + parseFloat(entry.protein),
        carbs: acc.carbs + parseFloat(entry.carbs),
      };
    },
    { fat: 0, protein: 0, carbs: 0, calories: 0 }
  );

  return {
    weekEnd,
    fat: ((weekMacros.fat * 9.579) / weekMacros.calories).toFixed(2),
    carbs: ((weekMacros.carbs * 4.256) / weekMacros.calories).toFixed(2),
    protein: ((weekMacros.protein * 4.283) / weekMacros.calories).toFixed(2),
  };
};

macrosRouter.get("/macros", async (ctx: Context) => {
  const cachedMacros: Array<FitbitMacrosData> = cache.get("macros", ctx);
  let macros;
  if (cachedMacros) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving macros from cache");
    macros = cachedMacros;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Retreiving macros from fitbit API");
    macros = (
      await Promise.all(
        Array(2)
          .fill(undefined)
          .map(async (_, index) => {
            const weeksAgo = index + 1;
            return getMacros(ctx, weeksAgo);
          })
      )
    ).sort((a, b) => {
      if (a.weekEnd === b.weekEnd) {
        return 0;
      }
      return a.weekEnd > b.weekEnd ? 1 : -1;
    });
    cache.set("macros", macros, ctx);
  }

  ctx.body = macros;
});

export { macrosRouter };
