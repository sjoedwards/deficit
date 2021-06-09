import { Next, Context } from "koa";

const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = "An error has occured";
    ctx.app.emit("error", err, ctx);
  }
};

export { errorMiddleware };
