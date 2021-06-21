"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.macrosRouter = void 0;
var axios_1 = require("axios");
var moment_1 = require("moment");
var router_1 = require("@koa/router");
var cache_1 = require("../cache");
var macrosRouter = new router_1["default"]();
exports.macrosRouter = macrosRouter;
var getMacros = function (ctx, weeksAgo) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, weekStart, weekEnd, macros, weekMacros;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = {
                    Authorization: "Bearer " + ctx.state.token
                };
                weekStart = moment_1["default"]()
                    .subtract(weeksAgo, "weeks")
                    .startOf("isoWeek")
                    .format("YYYY-MM-DD");
                weekEnd = moment_1["default"]()
                    .subtract(weeksAgo, "weeks")
                    .endOf("isoWeek")
                    .format("YYYY-MM-DD");
                return [4 /*yield*/, Promise.all(Array(7)
                        .fill(undefined)
                        .map(function (_, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var date, macrosResult, calories, protein, carbs, fat;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    date = moment_1["default"](weekStart).add(index, "days").format("YYYY-MM-DD");
                                    return [4 /*yield*/, axios_1["default"]({
                                            url: "https://api.fitbit.com/1/user/-/foods/log/date/" + date + ".json",
                                            method: "get",
                                            headers: headers
                                        })];
                                case 1:
                                    macrosResult = (_a.sent()).data.summary;
                                    calories = macrosResult.calories, protein = macrosResult.protein, carbs = macrosResult.carbs, fat = macrosResult.fat;
                                    return [2 /*return*/, {
                                            date: date,
                                            calories: calories,
                                            protein: protein,
                                            carbs: carbs,
                                            fat: fat
                                        }];
                            }
                        });
                    }); }))];
            case 1:
                macros = _a.sent();
                weekMacros = macros.reduce(function (acc, entry) {
                    return {
                        calories: acc.calories + parseFloat(entry.calories),
                        fat: acc.fat + parseFloat(entry.fat),
                        protein: acc.protein + parseFloat(entry.protein),
                        carbs: acc.carbs + parseFloat(entry.carbs)
                    };
                }, { fat: 0, protein: 0, carbs: 0, calories: 0 });
                return [2 /*return*/, {
                        weekEnd: weekEnd,
                        fat: ((weekMacros.fat * 9.579) / weekMacros.calories).toFixed(2),
                        carbs: ((weekMacros.carbs * 4.256) / weekMacros.calories).toFixed(2),
                        protein: ((weekMacros.protein * 4.283) / weekMacros.calories).toFixed(2)
                    }];
        }
    });
}); };
macrosRouter.get("/macros", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cachedMacros, macros;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cachedMacros = cache_1.cache.get("macros", ctx);
                if (!cachedMacros) return [3 /*break*/, 1];
                /* eslint-disable-next-line no-console */
                console.log("Retrieving macros from cache");
                macros = cachedMacros;
                return [3 /*break*/, 3];
            case 1:
                /* eslint-disable-next-line no-console */
                console.log("Retreiving macros from fitbit API");
                return [4 /*yield*/, Promise.all(Array(2)
                        .fill(undefined)
                        .map(function (_, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var weeksAgo;
                        return __generator(this, function (_a) {
                            weeksAgo = index + 1;
                            return [2 /*return*/, getMacros(ctx, weeksAgo)];
                        });
                    }); }))];
            case 2:
                macros = (_a.sent()).sort(function (a, b) {
                    if (a.weekEnd === b.weekEnd) {
                        return 0;
                    }
                    return a.weekEnd > b.weekEnd ? 1 : -1;
                });
                cache_1.cache.set("macros", macros, ctx);
                _a.label = 3;
            case 3:
                ctx.body = macros;
                return [2 /*return*/];
        }
    });
}); });
