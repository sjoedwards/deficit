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
    const calories = weeklyCalories.find((entry) => entry.weekEnd === weekEnd)
      ?.deficit;

    return {
      weekEnd,
      weight,
      calories,
    };
  });

  // Linear regression stuff here!

  // Extend so can pass in a week offset

  ctx.body = {};
});

export { goalsRouter };
