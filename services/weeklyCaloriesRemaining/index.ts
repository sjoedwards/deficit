import { differenceInDays, endOfWeek } from "date-fns";
import { FitbitDailyCaloriesData, FitbitWeeklyCaloriesData } from "../../types";
import { getWeeklyCalories as getWeeklyCaloriesCaloriesType } from "../calories";

class WeeklyCaloriesRemaining {
  public dailyCalorieDataForLastWeek: FitbitWeeklyCaloriesData;
  private weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  private getWeeklyCalories: typeof getWeeklyCaloriesCaloriesType;

  constructor(
    calories: FitbitDailyCaloriesData[],
    getWeeklyCalories: typeof getWeeklyCaloriesCaloriesType,
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
  ) {
    this.weekStartsOn = weekStartsOn || 0;
    this.getWeeklyCalories = getWeeklyCalories;
    this.dailyCalorieDataForLastWeek = this.getCurrentWeekCalories(calories);
  }

  caloriesRequiredPerDayToMeetGoal(goal: number) {
    const date = new Date();
    const tendOfWeek = endOfWeek(date, { weekStartsOn: this.weekStartsOn });
    const averageCaloriesThisWeek = parseInt(
      this.dailyCalorieDataForLastWeek.calories,
      10
    );

    const daysRemainingInWeek = differenceInDays(tendOfWeek, date) + 1;

    const daysElapsedThisWeek = 7 - daysRemainingInWeek;

    const weeklyGoal = goal * 7;
    const totalCaloriesThisWeek = daysElapsedThisWeek * averageCaloriesThisWeek;
    const caloriesForRemainingDaysThisWeek =
      (weeklyGoal - totalCaloriesThisWeek) / daysRemainingInWeek;

    return Math.round(caloriesForRemainingDaysThisWeek);
  }

  private getCurrentWeekCalories(
    calories: FitbitDailyCaloriesData[]
  ): FitbitWeeklyCaloriesData {
    const weeklyCalories = this.getWeeklyCalories(calories, {
      weekStartsOn: this.weekStartsOn,
    });
    const latestEntry = weeklyCalories?.[weeklyCalories.length - 1];
    if (!latestEntry) {
      throw new Error("Cant find latest element for calories");
    }
    return latestEntry;
  }
}

export default WeeklyCaloriesRemaining;
