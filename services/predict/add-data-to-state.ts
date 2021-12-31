import { IExtendedRequest, ResolutionNames } from "../../types";

// Start here
const addDataToState = (
  resolution: T,
  request: IExtendedRequest,
  calories,
  weight
): Promise<CalorieResolutionType<T>> => {
  request.state = {
    ...request?.state,
    data: { ...request?.state?.data, calories, weight },
  };
};

export { addDataToState };
