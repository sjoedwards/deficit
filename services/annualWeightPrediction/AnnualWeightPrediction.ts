import { FitbitDailyCaloriesData, FitbitDailyWeightData } from "../../types";

class AnnualWeightPredictionService {
  private calories: FitbitDailyCaloriesData[];
  private weight: FitbitDailyWeightData[];

  constructor(
    calories: FitbitDailyCaloriesData[],
    weight: FitbitDailyWeightData[]
  ) {
    this.calories = calories;
    this.weight = weight;
    // const weightsGroupedByYear = groupWeightsByYear(weights);
    // const addannualWeightLinearRegression =
    //   getLinearRegressionForWeights(weightsGroupedByYear);
    // const weightDiffForEachYeay = getWeightDiff();
  }
}

export default AnnualWeightPredictionService;
