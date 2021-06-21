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
exports.weightRouter = exports.weightService = void 0;
var moment_1 = require("moment");
var axios_1 = require("axios");
var router_1 = require("@koa/router");
var cache_1 = require("../cache");
var weightRouter = new router_1["default"]();
exports.weightRouter = weightRouter;
var getWeight = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, getDatesForNMonthsAgo, weightResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = {
                    Authorization: "Bearer " + ctx.state.token
                };
                getDatesForNMonthsAgo = function (monthsAgo) {
                    return Array.from({ length: monthsAgo }, function (_, index) {
                        return moment_1["default"]()
                            .subtract(index, "months")
                            .locale("en-gb")
                            .format("YYYY-MM-DD");
                    }).reverse();
                };
                return [4 /*yield*/, Promise.all(getDatesForNMonthsAgo(6).map(function (baseDate) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, axios_1["default"]({
                                        url: "https://api.fitbit.com/1/user/-/body/log/weight/date/" + baseDate + "/1m.json",
                                        method: "get",
                                        headers: headers
                                    })];
                                case 1: return [2 /*return*/, (_b = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.weight];
                            }
                        });
                    }); }))];
            case 1:
                weightResponse = (_a.sent())
                    .reduce(
                // Flatten results into one array
                function (acc, month) {
                    return acc.concat(month);
                }, [])
                    // remove duplicate dates
                    .reduce(function (acc, current) {
                    var currentItemExists = acc.find(function (item) { return item.date === current.date && item.weight === current.weight; });
                    if (!currentItemExists) {
                        return acc.concat([current]);
                    }
                    else {
                        return acc;
                    }
                }, []);
                return [2 /*return*/, weightResponse.map(function (_a) {
                        var date = _a.date, weight = _a.weight;
                        return {
                            dateTime: date,
                            weight: weight === null || weight === void 0 ? void 0 : weight.toString()
                        };
                    })];
        }
    });
}); };
var getMonthlyWeight = function (apiWeight) { return __awaiter(void 0, void 0, void 0, function () {
    var monthlyWeight;
    return __generator(this, function (_a) {
        monthlyWeight = apiWeight
            // Get unique weeks
            .map(function (entry) {
            return moment_1["default"](entry.dateTime).locale("en-gb").month();
        })
            .filter(function (value, index, self) { return self.indexOf(value) === index; })
            // Nested array of entries for each week
            .map(function (month) {
            return apiWeight.filter(function (entry) { return moment_1["default"](entry.dateTime).locale("en-gb").month() === month; });
        })
            .map(function (monthlyWeight) {
            return {
                // Reduce each week to a single value
                weight: (monthlyWeight.reduce(function (sum, _a) {
                    var weight = _a.weight;
                    return sum + parseFloat("" + weight);
                }, 0) / monthlyWeight.length).toFixed(1),
                // Find the week end date from the first value
                monthEnd: (function () {
                    return moment_1["default"](Object.values(monthlyWeight)[0].dateTime)
                        .endOf("month")
                        .format("YYYY-MM-DD");
                })()
            };
        })
            .filter(function (month) {
            return month.monthEnd !==
                moment_1["default"]().locale("en-gb").endOf("month").format("YYYY-MM-DD");
        });
        return [2 /*return*/, monthlyWeight];
    });
}); };
var getWeeklyWeight = function (apiWeight, decimalPlaces) { return __awaiter(void 0, void 0, void 0, function () {
    var weeklyWeight;
    return __generator(this, function (_a) {
        weeklyWeight = apiWeight
            // Get unique weeks
            .map(function (entry) {
            return moment_1["default"](entry.dateTime).locale("en-gb").week();
        })
            .filter(function (value, index, self) { return self.indexOf(value) === index; })
            // Nested array of entries for each week
            .map(function (week) {
            return apiWeight.filter(function (entry) { return moment_1["default"](entry.dateTime).locale("en-gb").week() === week; });
        })
            .map(function (weeklyWeight) {
            return {
                // Reduce each week to a single value
                weight: (function () {
                    var weight = weeklyWeight.reduce(function (sum, _a) {
                        var weight = _a.weight;
                        return sum + parseFloat("" + weight);
                    }, 0) / weeklyWeight.length;
                    return decimalPlaces
                        ? weight.toFixed(decimalPlaces)
                        : weight.toString();
                })(),
                // Find the week end date from the first value
                weekEnd: (function () {
                    return moment_1["default"](Object.values(weeklyWeight)[0].dateTime)
                        .endOf("isoWeek")
                        .format("YYYY-MM-DD");
                })()
            };
        })
            .filter(function (week) {
            return week.weekEnd !==
                moment_1["default"]().locale("en-gb").endOf("isoWeek").format("YYYY-MM-DD");
        });
        return [2 /*return*/, weeklyWeight];
    });
}); };
var weightService = function (resolution, ctx, decimalPlaces) { return __awaiter(void 0, void 0, void 0, function () {
    var weight, cachedWeight, resolutionsMap, _a, getWeightMethod, weightData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cachedWeight = cache_1.cache.get("weight", ctx);
                if (!cachedWeight) return [3 /*break*/, 1];
                /* eslint-disable-next-line no-console */
                console.log("Retrieving weight from cache");
                weight = cachedWeight;
                return [3 /*break*/, 3];
            case 1:
                /* eslint-disable-next-line no-console */
                console.log("Getting weight from fitbit");
                return [4 /*yield*/, getWeight(ctx)];
            case 2:
                weight = _b.sent();
                cache_1.cache.set("weight", weight, ctx);
                _b.label = 3;
            case 3:
                resolutionsMap = {
                    daily: function (weight) { return weight; },
                    weekly: function (weight) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getWeeklyWeight(weight, decimalPlaces)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); },
                    monthly: function (weight) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getMonthlyWeight(weight)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }
                };
                _a = Object.entries(resolutionsMap).find(function (_a) {
                    var key = _a[0];
                    return key === resolution;
                }) || [], getWeightMethod = _a[1];
                if (!getWeightMethod) {
                    ctx["throw"](400, "Resolution not supported");
                }
                return [4 /*yield*/, getWeightMethod(weight)];
            case 4:
                weightData = (_b.sent());
                return [2 /*return*/, weightData];
        }
    });
}); };
exports.weightService = weightService;
weightRouter.get("/weight/:resolution", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var resolution, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                resolution = ctx.params.resolution || "weekly";
                _a = ctx;
                return [4 /*yield*/, exports.weightService(resolution, ctx, 1)];
            case 1:
                _a.body = _b.sent();
                return [2 /*return*/];
        }
    });
}); });
