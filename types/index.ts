export interface APIFitbitCaloriesData {
  dateTime: string;
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
export interface FitbitData {
  value: string;
  dateTime: string;
}

export interface FitbitCaloriesData {
  weekEnd: string;
  calories: string;
  activityCalories: string;
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
