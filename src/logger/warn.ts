import { Context } from "koa";

const logWarning = (message: string, ctx: Context) =>
  console.warn(message, JSON.stringify(ctx.state));

export { logWarning };
