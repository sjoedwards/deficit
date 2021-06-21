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
exports.deficitRouter = void 0;
var calories_1 = require("../services/calories");
var router_1 = require("@koa/router");
var cache_1 = require("../cache");
var predict_1 = require("../services/predict");
var group_into_monthly_calories_1 = require("../tools/group-into-monthly-calories");
var deficitRouter = new router_1["default"]();
exports.deficitRouter = deficitRouter;
var getAverageDeficit = function (calories) {
    return (calories.reduce(function (sum, _a) {
        var deficit = _a.deficit;
        return sum + parseInt("" + deficit, 10);
    }, 0) / calories.length).toFixed(0);
};
deficitRouter.get("/deficit", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var calories, cachedCalories, monthlyCalories, caloriesCurrentMonth, deficitsCurrentMonth, averageDeficitCurrentMonth, goal, _a, weightDiff, rSquaredValue, deficitForRemainingDaysThisMonth, _b, weightDiff3Point, rSquaredValue3Point, deficitForRemainingDaysThisMonthFixed3Point, _c, weightDiff5Point, rSquaredValue5Point, deficitForRemainingDaysThisMonthFixed5Point, weightDiffFixed, deficitForRemainingDaysThisMonthFixed;
    return __generator(this, function (_d) {
        switch (_d.label) {
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
                return [4 /*yield*/, calories_1.getCalories(ctx)];
            case 2:
                calories = _d.sent();
                cache_1.cache.set("calories", calories, ctx);
                _d.label = 3;
            case 3:
                monthlyCalories = group_into_monthly_calories_1.groupIntoMonthlyCalories(calories);
                caloriesCurrentMonth = monthlyCalories[monthlyCalories.length - 1];
                deficitsCurrentMonth = caloriesCurrentMonth.map(function (_a) {
                    var dateTime = _a.dateTime, deficit = _a.deficit;
                    return ({ dateTime: dateTime, deficit: deficit });
                });
                averageDeficitCurrentMonth = getAverageDeficit(caloriesCurrentMonth);
                goal = -0.25;
                return [4 /*yield*/, predict_1.predictService(ctx, averageDeficitCurrentMonth, "weekly", goal)];
            case 4:
                _a = (_d.sent()) ||
                    {}, weightDiff = _a.weightDiff, rSquaredValue = _a.rSquaredValue, deficitForRemainingDaysThisMonth = _a.deficitForRemainingDaysThisMonth;
                return [4 /*yield*/, predict_1.predictService(ctx, averageDeficitCurrentMonth, "weekly", goal, {
                        weightDiffMovingAverage: 3
                    })];
            case 5:
                _b = (_d.sent()) || {}, weightDiff3Point = _b.weightDiff, rSquaredValue3Point = _b.rSquaredValue, deficitForRemainingDaysThisMonthFixed3Point = _b.deficitForRemainingDaysThisMonth;
                return [4 /*yield*/, predict_1.predictService(ctx, averageDeficitCurrentMonth, "weekly", goal, {
                        weightDiffMovingAverage: 5
                    })];
            case 6:
                _c = (_d.sent()) || {}, weightDiff5Point = _c.weightDiff, rSquaredValue5Point = _c.rSquaredValue, deficitForRemainingDaysThisMonthFixed5Point = _c.deficitForRemainingDaysThisMonth;
                weightDiffFixed = weightDiff.toFixed(3);
                deficitForRemainingDaysThisMonthFixed = deficitForRemainingDaysThisMonth.toFixed(0);
                ctx.body = {
                    message: "At your daily deficit of " + averageDeficitCurrentMonth + " calories (averaged over days this month), you are predicted to " + (weightDiff >= 0 ? "gain" : "lose") + " " + Math.abs(parseFloat(weightDiffFixed)) + " kilograms per week, based off of your historic metabolic data. You need to average " + deficitForRemainingDaysThisMonthFixed + " calories a day for the rest of the month.",
                    averageDeficitCurrentMonth: averageDeficitCurrentMonth,
                    // TODO replace with frontend functionality
                    predictedWeeklyWeightDiff: {
                        noMovingAverage: {
                            weightDiffKilos: weightDiffFixed,
                            rSquaredValue: rSquaredValue.toFixed(3),
                            deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed
                        },
                        threePointMoving: {
                            weightDiffKilos: weightDiff3Point.toFixed(3),
                            rSquaredValue: rSquaredValue3Point.toFixed(3),
                            deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed3Point.toFixed(0)
                        },
                        fivePointMoving: {
                            weightDiffKilos: weightDiff5Point.toFixed(3),
                            rSquaredValue: rSquaredValue5Point.toFixed(3),
                            deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonthFixed5Point.toFixed(0)
                        }
                    },
                    deficits: deficitsCurrentMonth
                };
                return [2 /*return*/];
        }
    });
}); });
