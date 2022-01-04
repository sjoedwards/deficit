import {
  FitbitMonthlyCaloriesData,
  FitbitWeeklyCaloriesData,
  FitbitWeeklyWeightData,
  FitbitMonthlyWeightData,
  IExtendedRequest,
} from "../../types";

// Start here
const addDataToState = (
  request: IExtendedRequest,
  calories: FitbitWeeklyCaloriesData[] | FitbitMonthlyCaloriesData[],
  weight: FitbitWeeklyWeightData[] | FitbitMonthlyWeightData[]
): void => {
  request.state = {
    ...request?.state,
    data: { ...request?.state?.data, calories, weight },
  };
};

export { addDataToState };
