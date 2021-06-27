import { Context } from "koa";

import Router from "@koa/router";

const tokenRouter = new Router();

tokenRouter.get("/token", async (ctx: Context) => {
  ctx.redirect(`${process.env.CLIENT_URI}/api/token`);
});

export { tokenRouter };
