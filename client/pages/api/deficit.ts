import axios from "axios";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getConfig } from "../../tools/get-config";
import { logError } from "../../tools/log-error";
import nc, { NextConnect } from "next-connect";
import { setTokenFromCookieMiddleware } from "../../__tests__/pages/api/middleware/setTokenFromCookie";

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
const config = getConfig();

const getDeficit = async (req: NextApiRequest) => {
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
const handler = nc<NextApiRequest, NextApiResponse>()
  .use(setTokenFromCookieMiddleware())
  .get(async (req, res) => {
    try {
      const result = await getDeficit(req);
      res.json(result);
    } catch (e) {
      if (e?.response?.status === 401) {
        return res.status(401).end();
      }
      logError(e);
      return res.status(500).end();
    }
  });

export default handler;
