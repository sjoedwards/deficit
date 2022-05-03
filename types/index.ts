import { NextApiRequest } from "next";

export interface IExtendedRequest extends NextApiRequest {
  state?: {
    token?: string;
    data?: {
      calories?: FitbitMonthlyCaloriesData[] | FitbitWeeklyCaloriesData[];
      weight?: FitbitMonthlyWeightData[] | FitbitWeeklyWeightData[];
    };
  };
}

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

export interface FitbitWeightData {
  weight: string;
}
export interface FitbitDailyWeightData extends FitbitWeightData {
  dateTime: string;
}

export interface FitbitWeeklyWeightData extends FitbitWeightData {
  weekEnd: string;
  weightDiff?: string;
}

export interface FitbitMonthlyWeightData extends FitbitWeightData {
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

export type ResolutionNames = "daily" | "weekly" | "monthly" | "quarterly";

export interface DeficitGoalData {
  weightDiff?: string;
  deficit?: string;
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
  goal: number;
  deficitForRemainingDaysThisMonth?: number;
  deficitForRemainingDaysThisQuarter?: number;
  combinedValues: DeficitGoalData[];
}

export type WeightResolutionType<T> = T extends "daily"
  ? FitbitDailyWeightData[]
  : T extends "weekly"
  ? FitbitWeeklyWeightData[]
  : T extends "monthly"
  ? FitbitMonthlyWeightData[]
  : T extends "quarterly"
  ? FitbitMonthlyWeightData[]
  : never;

export enum EMethod {
  GET = "GET",
  POST = "POST",
}

export interface IFitbitOptions {
  headers: {};
}

export type CalorieResolutionType<T> = T extends "daily"
  ? FitbitDailyCaloriesData[]
  : T extends "weekly"
  ? FitbitWeeklyCaloriesData[]
  : T extends "monthly"
  ? FitbitMonthlyCaloriesData[]
  : T extends "quarterly"
  ? FitbitMonthlyCaloriesData[]
  : never;

export interface IPredictServiceOptions {
  weightDiffMovingAverage: number;
}

export interface IDeficitApiData {
  dateTime: string;
  deficit: string;
}

export interface IAnnualWeightData {
  year: string;
  weightData: FitbitDailyWeightData[];
  linearRegression?: LinearRegressionInformation;
}

export interface IDeficitServiceResponse {
  averageDeficitCurrentMonth: string;
  predictedWeeklyWeightDiff: {
    noMovingAverage: {
      weightDiffKilos: string | 0 | undefined;
      rSquaredValue: string | 0 | undefined;
      deficitForRemainingDaysThisMonth: string | 0 | undefined;
      combinedValues: DeficitGoalData[] | undefined;
    };
    threePointMoving: {
      weightDiffKilos: string | 0 | undefined;
      rSquaredValue: string | 0 | undefined;
      deficitForRemainingDaysThisMonth: string | 0 | undefined;
      combinedValues: DeficitGoalData[] | undefined;
    };
    fivePointMoving: {
      weightDiffKilos: string | 0 | undefined;
      rSquaredValue: string | 0 | undefined;
      deficitForRemainingDaysThisMonth: string | 0 | undefined;
      combinedValues: DeficitGoalData[] | undefined;
    };
  };
  deficits: Array<IDeficitApiData>;
  currentQuarter: {
    averageDeficitCurrentQuarter: string;
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        weightDiffKilos: string | 0 | undefined;
        rSquaredValue: string | 0 | undefined;
        deficitForRemainingDaysThisQuarter: string | 0 | undefined;
        combinedValues: DeficitGoalData[] | undefined;
      };
    };
  };
}
