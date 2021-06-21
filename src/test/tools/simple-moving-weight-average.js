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
exports.__esModule = true;
exports.simpleMovingWeightAverage = void 0;
var simpleMovingWeightAverage = function (weights, window) {
    if (window === void 0) { window = 5; }
    if (!weights || weights.length < window) {
        return [];
    }
    if (!weights.every(function (_a) {
        var weightDiff = _a.weightDiff;
        return weightDiff;
    })) {
        return [];
    }
    // e.g index = 2 when window is 3
    var index = window - 1;
    var length = weights.length + 1;
    var simpleMovingAverages = [];
    while (++index < length) {
        // index incremented, so now 3
        // 3-3 = 0 weights.slice(0, 3); Gets first 3 items
        var windowSlice = weights.slice(index - window, index);
        // Sum and average slice
        var sum = windowSlice.reduce(function (prev, _a) {
            var weightDiff = _a.weightDiff;
            return prev + parseFloat(weightDiff);
        }, 0);
        var averageWeightDiff = sum / window;
        var middleElement = windowSlice[Math.round((windowSlice.length - 1) / 2)];
        simpleMovingAverages.push(__assign(__assign({}, middleElement), { weightDiff: averageWeightDiff.toString() }));
    }
    return simpleMovingAverages;
};
exports.simpleMovingWeightAverage = simpleMovingWeightAverage;
