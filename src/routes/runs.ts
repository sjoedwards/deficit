import { FitbitActivityData } from "./../../types/index";
import { Context } from "koa";

import axios from "axios";
import moment from "moment";
import Router from "@koa/router";

const runRouter = new Router();

const getRuns = async (ctx: Context): Promise<Array<FitbitActivityData>> => {
  const headers = {
    Authorization: `Bearer ${ctx.state.token}`,
  };
  const activities = (
    await axios({
      url: `https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=${moment()
        .add(1, "days")
        .format("YYYY-MM-DD")}&offset=0&limit=20&sort=desc`,
      method: "get",
      headers,
    })
  ).data?.activities;

  return activities.filter(
    ({ activityName }: FitbitActivityData) => activityName === "Run"
  );
};

runRouter.get("/runs", async (ctx: Context) => {
  const runs = await getRuns(ctx);

  const formattedActivities = runs
    .map(({ distance, pace, originalStartTime, activeDuration }) => {
      return {
        date: moment(originalStartTime).format("YYYY-MM-DD"),
        distance: parseFloat(distance).toFixed(2),
        duration: moment
          .utc(moment.duration(activeDuration, "milliseconds").asMilliseconds())
          .format("HH:mm:ss"),
        pace: moment
          .utc(moment.duration(pace, "seconds").asMilliseconds())
          .format("HH:mm:ss"),
      };
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        return 0;
      }
      return a.date > b.date ? 1 : -1;
    });

  ctx.body = formattedActivities;
});

export { runRouter };
