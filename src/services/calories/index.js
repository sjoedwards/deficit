"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.caloriesService = exports.getCalories = void 0;
var axios_1 = require("axios");
var moment_1 = require("moment");
var cache_1 = require("../../cache");
var getMonthlyCalories = function (apiCalories) { return __awaiter(void 0, void 0, void 0, function () {
    var monthlyCalories;
    return __generator(this, function (_a) {
        monthlyCalories = apiCalories
            // Get unique months
            .map(function (entry) {
            return moment_1["default"](entry.dateTime).locale("en-gb").month();
        })
            .filter(function (value, index, self) { return self.indexOf(value) === index; })
            // Nested array of entries for each month
            .map(function (month) {
            return apiCalories.filter(function (entry) { return moment_1["default"](entry.dateTime).locale("en-gb").month() === month; });
        })
            .map(function (monthlyCalories) {
            var averageCalories = {
                // Reduce each month to a single value
                calories: (monthlyCalories.reduce(function (sum, _a) {
                    var calories = _a.calories;
                    return sum + parseInt("" + calories, 10);
                }, 0) / monthlyCalories.length).toFixed(0),
                // Reduce each month to a single value
                activityCalories: (monthlyCalories.reduce(function (sum, _a) {
                    var activityCalories = _a.activityCalories;
                    return sum + parseInt("" + activityCalories, 10);
                }, 0) / monthlyCalories.length).toFixed(0),
                // Find the month end date from the first value
                monthEnd: (function () {
                    return moment_1["default"](Object.values(monthlyCalories)[0].dateTime)
                        .endOf("month")
                        .format("YYYY-MM-DD");
                })()
            };
            return __assign(__assign({}, averageCalories), { deficit: (parseInt(averageCalories.calories) -
                    parseInt(averageCalories.activityCalories)).toString() });
        })
            // Filter results from this month
            .filter(function (month) {
            return month.monthEnd !==
                moment_1["default"]().locale("en-gb").endOf("month").format("YYYY-MM-DD");
        });
        return [2 /*return*/, monthlyCalories];
    });
}); };
var getCalories = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, caloriesResponse, activityCaloriesResponse, calories;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = {
                    Authorization: "Bearer " + ctx.state.token
                };
                return [4 /*yield*/, axios_1["default"]({
                        url: "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/6m.json",
                        method: "get",
                        headers: headers
                    })];
            case 1:
                caloriesResponse = (_a.sent()).data["foods-log-caloriesIn"].filter(function (_a) {
                    var value = _a.value;
                    return parseInt(value) !== 0;
                });
                return [4 /*yield*/, axios_1["default"]({
                        url: "https://api.fitbit.com/1/user/-/activities/calories/date/today/6m.json",
                        method: "get",
                        headers: headers
                    })];
            case 2:
                activityCaloriesResponse = (_a.sent()).data["activities-calories"].filter(function (_a) {
                    var value = _a.value;
                    return parseInt(value) !== 0;
                });
                calories = activityCaloriesResponse.map(function (_a) {
                    var _b;
                    var dateTime = _a.dateTime, activityCalories = _a.value;
                    // Find the caloriesResponse entry for the dateTime
                    var caloriesIn = ((_b = caloriesResponse.find(function (entry) { return entry.dateTime === dateTime; })) === null || _b === void 0 ? void 0 : _b.value) ||
                        "0";
                    return {
                        dateTime: dateTime,
                        calories: caloriesIn || "0",
                        activityCalories: activityCalories,
                        deficit: (parseInt(caloriesIn) - parseInt(activityCalories)).toString()
                    };
                });
                return [2 /*return*/, calories];
        }
    });
}); };
exports.getCalories = getCalories;
var getWeeklyCalories = function (apiCalories) { return __awaiter(void 0, void 0, void 0, function () {
    var weeklyCalories;
    return __generator(this, function (_a) {
        weeklyCalories = apiCalories
            // Get unique weeks
            .map(function (entry) {
            return moment_1["default"](entry.dateTime).locale("en-gb").week();
        })
            .filter(function (value, index, self) { return self.indexOf(value) === index; })
            // Nested array of entries for each week
            .map(function (week) {
            return apiCalories.filter(function (entry) { return moment_1["default"](entry.dateTime).locale("en-gb").week() === week; });
        })
            .map(function (weeklyCalories) {
            var averageCalories = {
                // Reduce each week to a single value
                calories: (weeklyCalories.reduce(function (sum, _a) {
                    var calories = _a.calories;
                    return sum + parseInt("" + calories, 10);
                }, 0) / weeklyCalories.length).toFixed(0),
                // Reduce each week to a single value
                activityCalories: (weeklyCalories.reduce(function (sum, _a) {
                    var activityCalories = _a.activityCalories;
                    return sum + parseInt("" + activityCalories, 10);
                }, 0) / weeklyCalories.length).toFixed(0),
                // Find the week end date from the first value
                weekEnd: (function () {
                    return moment_1["default"](Object.values(weeklyCalories)[0].dateTime)
                        .endOf("isoWeek")
                        .format("YYYY-MM-DD");
                })()
            };
            return __assign(__assign({}, averageCalories), { deficit: (parseInt(averageCalories.calories) -
                    parseInt(averageCalories.activityCalories)).toString() });
        })
            // Filter results from this week
            .filter(function (week) {
            return week.weekEnd !==
                moment_1["default"]().locale("en-gb").endOf("isoWeek").format("YYYY-MM-DD");
        });
        return [2 /*return*/, weeklyCalories];
    });
}); };
var caloriesService = function (resolution, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var calories, cachedCalories, resolutionsMap, _a, getCaloriesMethod, caloriesData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cachedCalories = cache_1.cache.get("calories", ctx);
                if (!cachedCalories) return [3 /*break*/, 1];
                /* eslint-disable-next-line no-console */
                console.log("Retrieving calories from cache");
                calories = cachedCalories;
                return [3 /*break*/, 3];
            case 1:
                /* eslint-disable-next-line no-console */
                console.log("Getting calories from fitbit");
                return [4 /*yield*/, exports.getCalories(ctx)];
            case 2:
                calories = _b.sent();
                cache_1.cache.set("calories", calories, ctx);
                _b.label = 3;
            case 3:
                resolutionsMap = {
                    daily: function (calories) { return calories; },
                    weekly: function (calories) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getWeeklyCalories(calories)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); },
                    monthly: function (calories) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getMonthlyCalories(calories)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }
                };
                _a = Object.entries(resolutionsMap).find(function (_a) {
                    var key = _a[0];
                    return key === resolution;
                }) || [], getCaloriesMethod = _a[1];
                if (!getCaloriesMethod) {
                    ctx["throw"](400, "Resolution not supported");
                }
                return [4 /*yield*/, getCaloriesMethod(calories)];
            case 4:
                caloriesData = (_b.sent());
                return [2 /*return*/, caloriesData];
        }
    });
}); };
exports.caloriesService = caloriesService;
