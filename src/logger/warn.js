"use strict";
exports.__esModule = true;
exports.logWarning = void 0;
var logWarning = function (message, ctx) {
    return console.warn(message, JSON.stringify(ctx.state));
};
exports.logWarning = logWarning;
