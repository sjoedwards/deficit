import { getWeeklyCalories } from "../../../services/calories";
import WeeklyCaloriesRemaining from "../../../services/weeklyCaloriesRemaining";
import { dailyCaloriesExpectedResponse } from "../../expected-responses/calories/daily";

beforeEach(() => {
  // stub date to 1 June 2021 22:57:05
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(1622588225000));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("WeeklyCaloriesRemaining", () => {
  describe("dailyCalorieDataForLastWeek", () => {
    it("should return the average calories for the current week", () => {
      const weeklyCaloriesRemainingService = new WeeklyCaloriesRemaining(
        dailyCaloriesExpectedResponse,
        getWeeklyCalories,
        5
      );

      const averageCaloriesRemainingForCurrentWeek =
        weeklyCaloriesRemainingService.dailyCalorieDataForLastWeek;
      expect(averageCaloriesRemainingForCurrentWeek).toEqual({
        calories: "3975",
        activityCalories: "4249",
        weekEnd: "2021-06-03",
        deficit: "-274",
      });
    });
  });
  describe("caloriesRequiredPerDayToMeetGoal", () => {
    it("returns the calories required for the rest of the week to meet a goal", () => {
      const weeklyCaloriesRemainingService = new WeeklyCaloriesRemaining(
        dailyCaloriesExpectedResponse,
        getWeeklyCalories,
        5
      );

      const caloriesRequiredPerDayToMeetGoal =
        weeklyCaloriesRemainingService.caloriesRequiredPerDayToMeetGoal(2500);

      expect(caloriesRequiredPerDayToMeetGoal).toEqual(533);
    });
  });
});
