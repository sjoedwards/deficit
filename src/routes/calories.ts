import { ResolutionNames } from "./../../types/index";

import { Context } from "koa";

import Router from "@koa/router";
import { caloriesService } from "../services/calories";

const caloriesRouter = new Router();

caloriesRouter.get("/calories/:resolution", async (ctx: Context) => {
  const resolution: ResolutionNames = ctx.params.resolution || "weekly";
  ctx.body = await caloriesService(resolution, ctx);
});

export { caloriesRouter };
