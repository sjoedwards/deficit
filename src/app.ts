import Koa from "koa";
import { config } from "dotenv";

const app = new Koa();

import { authzMiddleware } from "./middleware/authz";
import { setTokenFromCookieMiddleware } from "./middleware/setTokenFromCookie";
import { errorMiddleware } from "./middleware/error";
import { weightRouter } from "./routes/weight";
import { runRouter } from "./routes/runs";
import { macrosRouter } from "./routes/macros";
import { caloriesRouter } from "./routes/calories";
import { deficitRouter } from "./routes/deficit";
import { tokenRouter } from "./routes/token";
import cors from "@koa/cors";

config({ path: ".env" });

app
  .use(errorMiddleware)
  /* eslint-disable-next-line no-unused-vars */
  .on("error", (err, ctx): void => {
    /* eslint-disable-next-line no-console */
    console.error(err, ctx.state);
  })
  .use(cors({ credentials: true }))
  .use(setTokenFromCookieMiddleware)
  .use(authzMiddleware)
  .use(weightRouter.routes())
  .use(weightRouter.allowedMethods())
  .use(runRouter.routes())
  .use(runRouter.allowedMethods())
  .use(macrosRouter.routes())
  .use(macrosRouter.allowedMethods())
  .use(caloriesRouter.routes())
  .use(caloriesRouter.allowedMethods())
  .use(deficitRouter.routes())
  .use(deficitRouter.allowedMethods())
  .use(tokenRouter.routes())
  .use(tokenRouter.allowedMethods());

export { app };
