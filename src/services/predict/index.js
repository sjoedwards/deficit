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
exports.predictService = exports.getLinearRegressionInformation = exports.predictWeightDiffForDeficit = void 0;
var weight_1 = require("../../routes/weight");
var simple_statistics_1 = require("simple-statistics");
var moment_1 = require("moment");
var warn_1 = require("../../logger/warn");
var simple_moving_weight_average_1 = require("../../test/tools/simple-moving-weight-average");
var predict_deficit_for_remainder_1 = require("./predict-deficit-for-remainder");
var calories_1 = require("../calories");
var predictWeightDiffForDeficit = function (combinedValues, deficit, ctx, linearRegressionInformation) {
    var _a = linearRegressionInformation || {}, rSquaredValue = _a.rSquaredValue, regressionLine = _a.regressionLine;
    if (!rSquaredValue) {
        warn_1.logWarning("Determined RSquared value was falsey: " + rSquaredValue, ctx);
    }
    var weightDiff = regressionLine(deficit);
    if (!weightDiff) {
        warn_1.logWarning("Determined weightDiff value was falsey: " + rSquaredValue, ctx);
    }
    return { rSquaredValue: rSquaredValue, weightDiff: weightDiff };
};
exports.predictWeightDiffForDeficit = predictWeightDiffForDeficit;
var getLinearRegressionInformation = function (combinedWeeklyValues) {
    var coordinates = combinedWeeklyValues.map(function (_a) {
        var deficit = _a.deficit, weightDiff = _a.weightDiff;
        return [parseFloat(deficit), parseFloat(weightDiff)];
    });
    var _a = simple_statistics_1.linearRegression(coordinates), gradient = _a.m, intercept = _a.b;
    var regressionLine = simple_statistics_1.linearRegressionLine({ m: gradient, b: intercept });
    var rSquaredValue = simple_statistics_1.rSquared(coordinates, regressionLine);
    return { intercept: intercept, gradient: gradient, rSquaredValue: rSquaredValue, regressionLine: regressionLine };
};
exports.getLinearRegressionInformation = getLinearRegressionInformation;
var predictService = function (ctx, deficit, resolution, goal, options) { return __awaiter(void 0, void 0, void 0, function () {
    var isWeekly, isMonthly, calories_2, weight_2, weightWithDiff_1, simpleWeightMovingAverage_1, getCombinedWeeklyValues, combinedValues, linearRegressionInformation, weeklyWeightDiffForDeficit, deficitForRemainingDaysThisMonth, calories_3, weight_3, weightWithDiff_2, getCombinedMonthlyValues, combinedValues, linearRegressionInformation, monthlyDiffForDeficit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (resolution !== "weekly" && resolution !== "monthly") {
                    return [2 /*return*/, ctx["throw"](400, "resolution not supported")];
                }
                isWeekly = function (resolution) {
                    return resolution === "weekly";
                };
                isMonthly = function (resolution) {
                    return resolution === "monthly";
                };
                if (!isWeekly(resolution)) return [3 /*break*/, 4];
                return [4 /*yield*/, calories_1.caloriesService(resolution, ctx)];
            case 1:
                calories_2 = _a.sent();
                return [4 /*yield*/, weight_1.weightService(resolution, ctx)];
            case 2:
                weight_2 = _a.sent();
                ctx.state.data = __assign(__assign({}, ctx.state.data), { calories: calories_2,
                    weight: weight_2 });
                weightWithDiff_1 = weight_2
                    .map(function (value, index) {
                    var _a, _b;
                    var previousValueWeight = parseFloat((_a = weight_2[index - 1]) === null || _a === void 0 ? void 0 : _a.weight);
                    return __assign(__assign({}, value), { weightDiff: previousValueWeight &&
                            ((_b = (parseFloat(value.weight) - previousValueWeight)) === null || _b === void 0 ? void 0 : _b.toString()) });
                })
                    .filter(function (_a) {
                    var weightDiff = _a.weightDiff;
                    return weightDiff;
                });
                simpleWeightMovingAverage_1 = (options === null || options === void 0 ? void 0 : options.weightDiffMovingAverage) &&
                    simple_moving_weight_average_1.simpleMovingWeightAverage(weightWithDiff_1, options === null || options === void 0 ? void 0 : options.weightDiffMovingAverage);
                getCombinedWeeklyValues = function (deficitWeeksAgo) {
                    return (simpleWeightMovingAverage_1 || weightWithDiff_1)
                        .map(function (_a) {
                        var _b;
                        var weekEnd = _a.weekEnd, weightDiff = _a.weightDiff;
                        // Find the caloriesResponse entry for the dateTime
                        var deficit = (_b = calories_2.find(function (entry) {
                            return entry.weekEnd ===
                                moment_1["default"](weekEnd)
                                    .subtract(deficitWeeksAgo, "week")
                                    .format("YYYY-MM-DD");
                        })) === null || _b === void 0 ? void 0 : _b.deficit;
                        return {
                            weightDiff: weightDiff,
                            deficit: deficit
                        };
                    })
                        .filter(function (_a) {
                        var deficit = _a.deficit;
                        return typeof deficit !== "undefined";
                    });
                };
                combinedValues = getCombinedWeeklyValues(1);
                linearRegressionInformation = exports.getLinearRegressionInformation(combinedValues);
                weeklyWeightDiffForDeficit = exports.predictWeightDiffForDeficit(combinedValues, parseInt(deficit), ctx, linearRegressionInformation);
                return [4 /*yield*/, predict_deficit_for_remainder_1.predictDeficitForRemainderOfMonth(ctx, linearRegressionInformation.gradient, linearRegressionInformation.intercept, goal)];
            case 3:
                deficitForRemainingDaysThisMonth = _a.sent();
                return [2 /*return*/, __assign(__assign({}, weeklyWeightDiffForDeficit), { deficitForRemainingDaysThisMonth: deficitForRemainingDaysThisMonth,
                        goal: goal })];
            case 4:
                if (!isMonthly(resolution)) return [3 /*break*/, 7];
                return [4 /*yield*/, calories_1.caloriesService(resolution, ctx)];
            case 5:
                calories_3 = _a.sent();
                return [4 /*yield*/, weight_1.weightService(resolution, ctx)];
            case 6:
                weight_3 = _a.sent();
                ctx.state.data = __assign(__assign({}, ctx.state.data), { calories: calories_3,
                    weight: weight_3 });
                weightWithDiff_2 = weight_3
                    .map(function (value, index) {
                    var _a, _b;
                    var previousValueWeight = parseFloat((_a = weight_3[index - 1]) === null || _a === void 0 ? void 0 : _a.weight);
                    return __assign(__assign({}, value), { weightDiff: previousValueWeight &&
                            ((_b = (parseFloat(value.weight) - previousValueWeight)) === null || _b === void 0 ? void 0 : _b.toString()) });
                })
                    .filter(function (_a) {
                    var weightDiff = _a.weightDiff;
                    return weightDiff;
                });
                getCombinedMonthlyValues = function (deficitWeeksAgo) {
                    return weightWithDiff_2
                        .map(function (_a) {
                        var _b;
                        var monthEnd = _a.monthEnd, weightDiff = _a.weightDiff;
                        // Find the caloriesResponse entry for the dateTime
                        var deficit = (_b = calories_3.find(function (entry) {
                            return entry.monthEnd ===
                                moment_1["default"](monthEnd)
                                    .subtract(deficitWeeksAgo, "month")
                                    .format("YYYY-MM-DD");
                        })) === null || _b === void 0 ? void 0 : _b.deficit;
                        return {
                            weightDiff: weightDiff,
                            deficit: deficit
                        };
                    })
                        .filter(function (_a) {
                        var deficit = _a.deficit;
                        return typeof deficit !== "undefined";
                    });
                };
                combinedValues = getCombinedMonthlyValues(0);
                linearRegressionInformation = exports.getLinearRegressionInformation(combinedValues);
                monthlyDiffForDeficit = exports.predictWeightDiffForDeficit(combinedValues, parseInt(deficit), ctx, linearRegressionInformation);
                return [2 /*return*/, __assign(__assign({}, monthlyDiffForDeficit), { goal: goal })];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.predictService = predictService;
