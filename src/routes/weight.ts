import { FitbitWeightData } from "./../../types/index";
import { Context } from "koa";
import axios from "axios";
import moment from "moment";
import Router from "@koa/router";
import { cache } from "../cache";

const weightRouter = new Router();

const getWeight = async (
  ctx: Context,
  weeksAgo: number
): Promise<FitbitWeightData> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
  const weekEnd = moment()
    .subtract(weeksAgo, "weeks")
    .endOf("isoWeek")
    .format("YYYY-MM-DD");
  const weightLog: Array<{ weight: string }> = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/body/log/weight/date/${weekEnd}/1w.json`,
      method: "get",
      headers,
    })
  ).data.weight;
  const weight =
    weightLog.length &&
    (
      weightLog.reduce(
        (sum: number, { weight: weightAgg }: { weight: string }) =>
          sum + parseFloat(weightAgg),
        0
      ) / weightLog.length
    ).toFixed(1);
  return { weekEnd, weight };
};

const aggregateWeights = async (ctx: Context) => {
  return (
    await Promise.all(
      Array(6)
        .fill(undefined)
        .map(async (_, index) => {
          const weeksAgo = index + 1;
          return getWeight(ctx, weeksAgo);
        })
    )
  )
    .filter(({ weight }) => parseFloat(weight) !== 0)
    .sort((a, b) => {
      if (a.weekEnd === b.weekEnd) {
        return 0;
      }
      return a.weekEnd > b.weekEnd ? 1 : -1;
    });
};

weightRouter.get("/weight", async (ctx: Context) => {
  // TODO Cache should be a key which incorperates UID for each user
  const cachedWeight: Array<FitbitWeightData> = cache.get("weight", ctx);
  let weight;
  if (cachedWeight) {
    /* eslint-disable-next-line no-console */
    console.log("Retrieving weight from cache");
    weight = cachedWeight;
  } else {
    /* eslint-disable-next-line no-console */
    console.log("Getting weight from fitbit");
    weight = await aggregateWeights(ctx);

    cache.set("weight", weight, ctx);
  }
  ctx.body = weight;
});

export { weightRouter };
