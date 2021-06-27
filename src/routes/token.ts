import { Context } from "koa";

import Router from "@koa/router";

const tokenRouter = new Router();

tokenRouter.get("/token", async (ctx: Context) => {
  ctx.body = { accessToken: ctx.state.token };
});

export { tokenRouter };
