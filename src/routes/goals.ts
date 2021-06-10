import { weightService } from "./weight";
import { caloriesService } from "./calories";
import { Context } from "koa";
import Router from "@koa/router";

const goalsRouter = new Router();

goalsRouter.get("/goals", async (ctx: Context) => {
  const weeklyCalories = await caloriesService("weekly", ctx);
  const weeklyWeight = await weightService("weekly", ctx);

  const combinedWeeklyValues = weeklyWeight.map(({ weekEnd, weight }) => {
    // Find the caloriesResponse entry for the dateTime
    const calories = weeklyCalories.find((entry) => entry.weekEnd === weekEnd);

    return {
      weekEnd,
      weight,
      calories,
    };
  });

  console.log(combinedWeeklyValues);

  ctx.body = {};
});

export { goalsRouter };
