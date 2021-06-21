"use strict";
exports.__esModule = true;
exports.cache = void 0;
var node_cache_1 = require("node-cache");
var jsonwebtoken_1 = require("jsonwebtoken");
var nodeCache = new node_cache_1["default"]({ stdTTL: 3600, checkperiod: 300 });
var getSubjectFromAccessToken = function (ctx) {
    var accessToken = ctx.state.token;
    var payload = ((jsonwebtoken_1["default"] === null || jsonwebtoken_1["default"] === void 0 ? void 0 : jsonwebtoken_1["default"].decode(accessToken, { complete: true })) || {}).payload;
    if (!(payload === null || payload === void 0 ? void 0 : payload.sub)) {
        throw new Error("Could not obtain subject from access token");
    }
    return payload.sub;
};
var cache = {
    get: function (key, ctx) {
        var subject = getSubjectFromAccessToken(ctx);
        return nodeCache.get(key + "-" + subject);
    },
    set: function (key, value, ctx) {
        var subject = getSubjectFromAccessToken(ctx);
        var uniqueKey = key + "-" + subject;
        nodeCache.set(uniqueKey, value);
        return key + "-" + subject;
    },
    getInstance: function () { return nodeCache; }
};
exports.cache = cache;
