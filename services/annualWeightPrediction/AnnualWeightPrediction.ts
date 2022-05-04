import { endOfYear, getYear, isThisYear, startOfYear } from "date-fns";
import {
  linearRegression,
  linearRegressionLine,
  mean,
  rSquared,
} from "simple-statistics";
import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  IAnnualCaloriesData,
  IAnnualWeightData,
} from "../../types";

class AnnualWeightPredictionService {
  public annualWeightData: IAnnualWeightData[];
  public annualCaloriesData: IAnnualCaloriesData[];

  constructor(
    calories: FitbitDailyCaloriesData[],
    weight: FitbitDailyWeightData[]
  ) {
    this.annualCaloriesData = this.groupCaloriesByYear(calories);
    this.annualWeightData = this.groupWeightsByYear(weight);
    this.addLinearRegression();
    this.getWeightDiffForAnnualWeightData();
  }

  private groupCaloriesByYear(
    calories: FitbitDailyCaloriesData[]
  ): IAnnualCaloriesData[] {
    return calories.reduce<IAnnualCaloriesData[]>((acc, calories) => {
      const yearOfCurr = getYear(new Date(calories.dateTime));
      const indexOfYear = acc.findIndex(
        (entry) => parseFloat(entry.year) === yearOfCurr
      );

      const caloriesData = [
        ...(acc[indexOfYear]?.caloriesData || []),
        calories,
      ];

      const payload = {
        year: `${yearOfCurr}`,
        caloriesData,
        averageDeficit: mean(
          caloriesData.map(({ deficit }) => parseFloat(deficit))
        ),
      };
      if (acc[indexOfYear]) {
        acc[indexOfYear] = payload;
      } else {
        acc.push(payload);
      }
      return acc;
    }, []);
  }

  private groupWeightsByYear(
    weights: FitbitDailyWeightData[]
  ): IAnnualWeightData[] {
    return weights.reduce<IAnnualWeightData[]>((acc, weight) => {
      const yearOfCurr = getYear(new Date(weight.dateTime));
      const indexOfYear = acc.findIndex(
        (entry) => parseFloat(entry.year) === yearOfCurr
      );

      const payload = {
        year: `${yearOfCurr}`,
        weightData: [...(acc[indexOfYear]?.weightData || []), weight],
      };
      if (acc[indexOfYear]) {
        acc[indexOfYear] = payload;
      } else {
        acc.push(payload);
      }
      return acc;
    }, []);
  }
  private addLinearRegression() {
    this.annualWeightData = this.annualWeightData.map((annualWeight) => {
      const coordinates = annualWeight.weightData.map(
        ({ weight, dateTime }) => {
          return [
            parseFloat(`${new Date(dateTime).getTime()}`),
            parseFloat(`${weight}`),
          ];
        }
      );
      const { m: gradient, b: intercept } = linearRegression(coordinates);
      const regressionLine = linearRegressionLine({
        m: gradient,
        b: intercept,
      });
      const rSquaredValue = rSquared(coordinates, regressionLine);
      return {
        ...annualWeight,
        linearRegression: {
          intercept,
          gradient,
          rSquaredValue,
          regressionLine,
        },
      };
    });
  }
  private getWeightDiffForAnnualWeightData() {
    this.annualWeightData = this.annualWeightData.map((annualWeight) => {
      if (!annualWeight.linearRegression) {
        throw new Error(
          "No linear regression information, cannot weight diff for annual weights"
        );
      }
      const linearRegressionEquation = {
        m: annualWeight.linearRegression.gradient,
        b: annualWeight.linearRegression.intercept,
      };
      const weightYearStart = linearRegressionLine(linearRegressionEquation)(
        startOfYear(new Date(annualWeight.year)).getTime()
      );
      const weightYearEnd = linearRegressionLine(linearRegressionEquation)(
        endOfYear(new Date(annualWeight.year)).getTime()
      );

      return {
        ...annualWeight,
        annualWeightDiff: weightYearEnd - weightYearStart,
      };
    });
  }
  public predictWeightDiffUsingAnnualData = (deficit: number): number => {
    const currentYearWeightData = this.annualWeightData.find((weightData) =>
      isThisYear(new Date(weightData.year))
    );
    const currentYearCaloriesData = this.annualCaloriesData.find((weightData) =>
      isThisYear(new Date(weightData.year))
    );

    if (!currentYearWeightData || !currentYearCaloriesData) {
      throw new Error(
        "Cannot find weight or calorie information for current year"
      );
    }

    if (!currentYearWeightData.annualWeightDiff) {
      throw new Error("Annual weight diff is not initialised");
    }
    const coefficent =
      currentYearCaloriesData.averageDeficit /
      currentYearWeightData.annualWeightDiff;
    return deficit / coefficent;
  };
  // Return annual, monthly and weekly
}

export default AnnualWeightPredictionService;
