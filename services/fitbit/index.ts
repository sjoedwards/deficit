import axios from "axios";
import httpErrors from "http-errors";
import {
  APIFitbitWeightData,
  EMethod,
  IExtendedRequest,
  IFitbitOptions,
} from "../../types";

const getFitbitService = () => {
  const fitbitErrorMap = {
    401: httpErrors[401],
  };
  const getFitbitBaseUrl = (): string => "https://api.fitbit.com/1/user/-";
  const getDefaultHeaders = (request: IExtendedRequest) => ({
    Authorization: `Bearer ${request?.state?.token}`,
  });

  const getFitbitData = async (
    request: IExtendedRequest,
    path: string,
    headers?: Record<string, string>,
    method: EMethod = EMethod.GET
  ) => {
    const defaultHeaders = getDefaultHeaders(request);
    return await axios({
      url: `${getFitbitBaseUrl()}/${path}`,
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
      options: IFitbitOptions = { headers: {} }
    ): Promise<Array<APIFitbitWeightData>> {
      if (!baseDate) {
        throw new Error("Error getting weight, baseDate not defined");
      }
      const weightData = await getFitbitData(
        req,
        `body/log/weight/date/${baseDate}/1m.json`,
        options?.headers
      );
      return weightData?.data?.weight;
    },
  };
};

const fitbitService = getFitbitService();

export { fitbitService };
