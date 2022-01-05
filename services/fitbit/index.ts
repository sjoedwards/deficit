import axios from "axios";
// import httpErrors from "http-errors";
import {
  APIFitbitWeightData,
  EMethod,
  FitbitData,
  IExtendedRequest,
  IFitbitOptions,
} from "../../types";

const getFitbitService = () => {
  // const fitbitErrorMap = {
  //   401: httpErrors[401],
  // };
  const getDefaultHeaders = (request: IExtendedRequest) => ({
    Authorization: `Bearer ${request?.state?.token}`,
  });

  const getFitbitData = async (
    request: IExtendedRequest,
    url: string,
    headers?: Record<string, string>,
    method: EMethod = EMethod.GET
  ) => {
    const defaultHeaders = getDefaultHeaders(request);
    return await axios({
      url,
      method,
      headers: {
        ...defaultHeaders,
        headers,
      },
    });
  };
  return {
    async getWeight(
      req: IExtendedRequest,
      baseDate: string,
      period = "1m",
      options: IFitbitOptions = { headers: {} }
    ): Promise<Array<APIFitbitWeightData>> {
      if (!baseDate) {
        throw new Error("Error getting weight, baseDate not defined");
      }
      const weightData = await getFitbitData(
        req,
        `https://api.fitbit.com/1/user/-/body/log/weight/date/${baseDate}/${period}.json`,
        options?.headers
      );
      return weightData?.data?.weight;
    },
    async getCaloriesIn(
      req: IExtendedRequest,
      period = "6m",
      options: IFitbitOptions = { headers: {} }
    ): Promise<Array<FitbitData>> {
      const caloriesInResponse = await getFitbitData(
        req,
        `https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/${period}.json`,
        options?.headers
      );
      return caloriesInResponse?.data["foods-log-caloriesIn"].filter(
        ({ value }: FitbitData) => parseInt(value) !== 0
      );
    },
    async getActivityCalories(
      req: IExtendedRequest,
      period = "6m",
      options: IFitbitOptions = { headers: {} }
    ): Promise<Array<FitbitData>> {
      const activityCaloriesResponse = await getFitbitData(
        req,
        `https://api.fitbit.com/1/user/-/activities/calories/date/today/${period}.json`,
        options?.headers
      );
      return activityCaloriesResponse?.data["activities-calories"].filter(
        ({ value }: FitbitData) => parseInt(value) !== 0
      );
    },
  };
};

const fitbitService = getFitbitService();

export { fitbitService };
