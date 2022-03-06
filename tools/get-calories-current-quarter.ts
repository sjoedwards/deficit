import { FitbitDailyCaloriesData } from "../types/index";
import { isThisQuarter } from "date-fns";

const groupIntoQuarterlyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>
): Array<FitbitDailyCaloriesData> => {
  console.log(new Date());
  return apiCalories.filter((entry) => isThisQuarter(new Date(entry.dateTime)));
};

export { groupIntoQuarterlyCalories };
