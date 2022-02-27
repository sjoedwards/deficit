import { getMonth, getYear } from "date-fns";
import { FitbitDailyCaloriesData } from "./../types/index";

const groupIntoMonthlyCalories = (
  apiCalories: Array<FitbitDailyCaloriesData>
): Array<FitbitDailyCaloriesData>[] => {
  const result = apiCalories.reduce<Record<number, FitbitDailyCaloriesData[]>>(
    (acc, curr) => {
      const monthOfCurr = getMonth(new Date(curr.dateTime));
      const yearOfCurr = getYear(new Date(curr.dateTime));
      return {
        ...acc,
        [`${monthOfCurr}-${yearOfCurr}`]: [...(acc[monthOfCurr] || []), curr],
      };
    },
    {}
  );

  return Object.values(result);
};

export { groupIntoMonthlyCalories };
