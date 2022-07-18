import { FitbitDailyCaloriesData, FitbitWeeklyCaloriesData } from "../../types";
import { getWeeklyCalories } from "../calories";

class WeeklyCaloriesRemaining {
  public dailyCalorieDataForLastWeek: FitbitWeeklyCaloriesData[];

  constructor(calories: FitbitDailyCaloriesData[]) {
    this.dailyCalorieDataForLastWeek = this.getLastWeeksCalories(calories);
  }

  getLastWeeksCalories(calories: FitbitDailyCaloriesData[]) {
    // Start here - check that getWeeklyCalories(calories)[0] is the current week.
    // Then make a method to predict what remains
    return getWeeklyCalories(calories);
  }
}

export default WeeklyCaloriesRemaining;
