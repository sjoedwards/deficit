"use strict";
exports.__esModule = true;
exports.app = void 0;
var koa_1 = require("koa");
var dotenv_1 = require("dotenv");
var app = new koa_1["default"]();
exports.app = app;
var authz_1 = require("./middleware/authz");
var setTokenFromCookie_1 = require("./middleware/setTokenFromCookie");
var error_1 = require("./middleware/error");
var weight_1 = require("./routes/weight");
var runs_1 = require("./routes/runs");
var macros_1 = require("./routes/macros");
var calories_1 = require("./routes/calories");
var deficit_1 = require("./routes/deficit");
dotenv_1.config({ path: ".env" });
app
    .use(error_1.errorMiddleware)
    /* eslint-disable-next-line no-unused-vars */
    .on("error", function (err, ctx) {
    /* eslint-disable-next-line no-console */
    console.error(err, ctx.state);
    ctx.body = {
        message: "Uh oh, Sam messed up, tell him to fix it"
    };
})
    .use(setTokenFromCookie_1.setTokenFromCookieMiddleware)
    .use(authz_1.authzMiddleware)
    .use(weight_1.weightRouter.routes())
    .use(weight_1.weightRouter.allowedMethods())
    .use(runs_1.runRouter.routes())
    .use(runs_1.runRouter.allowedMethods())
    .use(macros_1.macrosRouter.routes())
    .use(macros_1.macrosRouter.allowedMethods())
    .use(calories_1.caloriesRouter.routes())
    .use(calories_1.caloriesRouter.allowedMethods())
    .use(deficit_1.deficitRouter.routes())
    .use(deficit_1.deficitRouter.allowedMethods());
