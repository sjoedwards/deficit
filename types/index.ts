export interface FitbitDailyCaloriesData {
  dateTime: string;
  calories: string;
  activityCalories: string;
  deficit: string;
}

export interface FitbitWeeklyCaloriesData {
  weekEnd: string;
  calories: string;
  activityCalories: string;
  deficit: string;
}
export interface FitbitMonthlyCaloriesData {
  monthEnd: string;
  calories: string;
  activityCalories: string;
  deficit: string;
}

export interface APIFitbitWeightData {
  bmi: number;
  date: string;
  logId: number;
  time: string;
  weight: number;
  source: string;
}
export interface FitbitDailyWeightData {
  dateTime: string;
  weight: string;
}

export interface FitbitWeeklyWeightData {
  weekEnd: string;
  weight: string;
}

export interface FitbitMonthlyWeightData {
  monthEnd: string;
  weight: string;
}

export interface FitbitData {
  value: string;
  dateTime: string;
}

export interface FitbitMacrosData {
  weekEnd: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface FitbitActivityData {
  distance: string;
  pace: string;
  originalStartTime: string;
  activeDuration: string;
  activityName: string;
}

export type ResolutionNames = "daily" | "weekly" | "monthly";

export interface DeficitGoalData {
  weightDiff: string;
  deficit: string;
}

export interface LinearRegressionInformation {
  intercept: number;
  gradient: number;
  rSquaredValue: number;
  regressionLine: (x: number) => number;
}

export interface PredictionData {
  weightDiff: number;
  rSquaredValue: number;
}
