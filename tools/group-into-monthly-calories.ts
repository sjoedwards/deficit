import moment from "moment";
import { FitbitDailyCaloriesData } from "./../../types/index";

const groupIntoMonthlyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>
): Array<FitbitDailyCaloriesData>[] => {
  return (
    apiCalories
      // Get unique months
      .map((entry) => {
        return moment(entry.dateTime).locale("en-gb").month();
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      // Nested array of entries for each month
      .map((month) =>
        apiCalories.filter(
          (entry) => moment(entry.dateTime).locale("en-gb").month() === month
        )
      )
  );
};

export { groupIntoMonthlyCalories };
