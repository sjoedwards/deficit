import { getYear } from "date-fns";
import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  IAnnualWeightData,
} from "../../types";

class AnnualWeightPredictionService {
  private calories: FitbitDailyCaloriesData[];
  public annualWeights: IAnnualWeightData[];

  constructor(
    calories: FitbitDailyCaloriesData[],
    weight: FitbitDailyWeightData[]
  ) {
    this.calories = calories;
    this.groupWeightsByYear(weight);
    this.addLinearRegression();
    // const addannualWeightLinearRegression =
    //   getLinearRegressionForWeights(weightsGroupedByYear);
    // const weightDiffForEachYeay = getWeightDiff();
  }
  groupWeightsByYear(weights: FitbitDailyWeightData[]): void {
    this.annualWeights = weights.reduce<IAnnualWeightData[]>((acc, weight) => {
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
  addLinearRegression() {
    this.annualWeights = this.annualWeights.map<IAnnualWeightData[]>();
  }
}

export default AnnualWeightPredictionService;
