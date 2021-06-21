"use strict";
exports.__esModule = true;
exports.getDeficitForWeightDiff = void 0;
var getDeficitForWeightDiff = function (goal, intercept, gradient) {
    // y = mx + c
    // weightDiff = m * deficit + c
    // (weightDiff - c) / m = deficit
    return (goal - intercept) / gradient;
};
exports.getDeficitForWeightDiff = getDeficitForWeightDiff;
