import moment from "moment";
import { FitbitDailyCaloriesData } from "./../types/index";
import { filterDuplicates } from "./filter-duplicates";

const groupIntoMonthlyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>
): Array<FitbitDailyCaloriesData>[] => {
  return (
    apiCalories
      // Get unique months
      .map((entry) => {
        return moment(entry.dateTime).locale("en-gb").month();
      })
      .filter(filterDuplicates)
      // Nested array of entries for each month
      .map((month) =>
        apiCalories.filter(
          (entry) => moment(entry.dateTime).locale("en-gb").month() === month
        )
      )
  );
};

export { groupIntoMonthlyCalories };
