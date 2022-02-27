import { FitbitDailyCaloriesData } from "./../../types/index";
import { getDeficitForWeightDiff } from "../../tools/get-deficit-for-weight-diff";
import { groupIntoMonthlyCalories } from "../../tools/group-into-monthly-calories";
import {
  differenceInCalendarDays,
  startOfQuarter,
  lastDayOfQuarter,
  differenceInDays,
  endOfMonth,
  getDaysInMonth,
} from "date-fns";
import { groupIntoQuarterlyCalories } from "../../tools/get-calories-current-quarter";

const getDaysLeftInMonth = () => {
  const today = new Date();
  return differenceInDays(endOfMonth(today), today);
};

const predictDeficitForRemainderOfMonth = async (
  calories: Array<FitbitDailyCaloriesData>,
  gradient: number,
  intercept: number,
  goal: number
): Promise<number> => {
  const daysInMonth = getDaysInMonth(new Date());
  const daysLeftInMonth = getDaysLeftInMonth();
  const averegeDeficitForGoal = getDeficitForWeightDiff(
    goal,
    intercept,
    gradient
  );
  const totalMonthlyDeficitForGoal = daysInMonth * averegeDeficitForGoal;
  const monthlyDeficits = groupIntoMonthlyCalories(calories);
  const deficitsCurrentMonth = monthlyDeficits[monthlyDeficits.length - 1];
  const totalDeficitCurrentMonth = deficitsCurrentMonth.reduce(
    (agg, { deficit }) => agg + parseFloat(deficit),
    0
  );
  const goalDeficitRemainingInMonth =
    totalMonthlyDeficitForGoal - totalDeficitCurrentMonth;
  const dailyDeficitRemainingPerDayThisMonth =
    goalDeficitRemainingInMonth / daysLeftInMonth;

  return dailyDeficitRemainingPerDayThisMonth;
};

const predictDeficitForRemainderOfQuarter = async (
  calories: Array<FitbitDailyCaloriesData>,
  gradient: number,
  intercept: number,
  goal: number
): Promise<number> => {
  const daysInQuater = differenceInCalendarDays(
    lastDayOfQuarter(new Date()),
    startOfQuarter(new Date())
  );

  const daysLeftInQuarter = differenceInCalendarDays(
    lastDayOfQuarter(new Date()),
    new Date()
  );
  const averegeDeficitForGoal = getDeficitForWeightDiff(
    goal,
    intercept,
    gradient
  );
  const totalQuarterlyDeficitForGoal = daysInQuater * averegeDeficitForGoal;
  const quarterlyDeficits = groupIntoQuarterlyCalories(calories);
  const deficitsCurrentQuarter = quarterlyDeficits;
  const totalDeficitCurrentQuarter = deficitsCurrentQuarter.reduce(
    (agg, { deficit }) => agg + parseFloat(deficit),
    0
  );
  const goalDeficitRemainingInQuarter =
    totalQuarterlyDeficitForGoal - totalDeficitCurrentQuarter;
  const dailyDeficitRemainingPerDayThisQuarter =
    goalDeficitRemainingInQuarter / daysLeftInQuarter;

  return dailyDeficitRemainingPerDayThisQuarter;
};

export {
  predictDeficitForRemainderOfMonth,
  predictDeficitForRemainderOfQuarter,
};
