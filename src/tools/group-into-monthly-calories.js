"use strict";
exports.__esModule = true;
exports.groupIntoMonthlyCalories = void 0;
var moment_1 = require("moment");
var groupIntoMonthlyCalories = function (apiCalories) {
    return (apiCalories
        // Get unique months
        .map(function (entry) {
        return moment_1["default"](entry.dateTime).locale("en-gb").month();
    })
        .filter(function (value, index, self) { return self.indexOf(value) === index; })
        // Nested array of entries for each month
        .map(function (month) {
        return apiCalories.filter(function (entry) { return moment_1["default"](entry.dateTime).locale("en-gb").month() === month; });
    }));
};
exports.groupIntoMonthlyCalories = groupIntoMonthlyCalories;
