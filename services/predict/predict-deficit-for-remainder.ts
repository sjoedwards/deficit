import { NextApiResponse } from "next";
import { IExtendedRequest } from "./../../types/index";
import moment from "moment";
import { getDeficitForWeightDiff } from "../../tools/get-deficit-for-weight-diff";
import { groupIntoMonthlyCalories } from "../../tools/group-into-monthly-calories";
import { caloriesService } from "./../calories/index";
import {
  differenceInCalendarDays,
  startOfQuarter,
  lastDayOfQuarter,
} from "date-fns";
import { groupIntoQuarterlyCalories } from "../../tools/get-calories-current-quarter";

const getDaysLeftInMonth = () => {
  const endOfMonth = moment().endOf("month");
  const today = moment();
  return endOfMonth.diff(today, "days");
};

const predictDeficitForRemainderOfMonth = async (
  request: IExtendedRequest,
  response: NextApiResponse,
  gradient: number,
  intercept: number,
  goal: number
): Promise<number> => {
  const daysInMonth = moment().daysInMonth();
  const daysLeftInMonth = getDaysLeftInMonth();
  const averegeDeficitForGoal = getDeficitForWeightDiff(
    goal,
    intercept,
    gradient
  );
  const totalMonthlyDeficitForGoal = daysInMonth * averegeDeficitForGoal;
  const dailyFitBitData = await caloriesService("daily", request, response);
  const monthlyDeficits = groupIntoMonthlyCalories(dailyFitBitData);
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
  request: IExtendedRequest,
  response: NextApiResponse,
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
  const dailyFitBitData = await caloriesService("daily", request, response);
  const quarterlyDeficits = groupIntoQuarterlyCalories(dailyFitBitData);
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
