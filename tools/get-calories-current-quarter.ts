import { FitbitDailyCaloriesData } from "../types/index";
import { isThisQuarter } from "date-fns";

const groupIntoQuarterlyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>
): Array<FitbitDailyCaloriesData> => {
  return apiCalories.filter((entry) => isThisQuarter(new Date(entry.dateTime)));
};

export { groupIntoQuarterlyCalories };
