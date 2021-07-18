import { deficitService } from "../../services/deficit";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getConfig } from "../../tools/get-config";
import nc from "next-connect";
import { setTokenFromCookieMiddleware } from "../../middleware/setTokenFromCookie";
import { authzMiddleware } from "../../middleware/authz";
import { errorMiddleware } from "../../middleware/error";
import { IExtendedRequest } from "../../types";

interface IDeficitResponse {
  averageDeficitCurrentMonth: string;
  predictedWeeklyWeightDiff: {
    noMovingAverage: {
      weightDiffKilos: string;
      deficitForRemainingDaysThisMonth: string;
    };
  };
  deficits: IDeficitApiData[];
}

interface IDeficitApiData {
  dateTime: string;
  deficit: string;
}

const getDeficit = async (req: NextApiRequest) => {
  const config = getConfig();
  if (!config?.urls?.deficit) {
    throw new Error(`Can't get deficit information, no URL defined`);
  }
  const cookie = req.headers.cookie;
  const headers = cookie ? { cookie } : {};

  const response = await axios.get<IDeficitResponse>(config.urls.deficit, {
    headers,
  });
  return response.data;
};
const handler = nc<IExtendedRequest, NextApiResponse>({
  onError: errorMiddleware,
})
  .use(setTokenFromCookieMiddleware)
  .use(authzMiddleware)
  .get(async (req, res) => {
    const result = await deficitService(req, res);
    res.json(result);
  });

export default handler;
