import axios from "axios";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { logError } from "../../tools/log-error";

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
const getConfig = () => ({
  urls: {
    deficit: process.env.NEXT_PUBLIC_DEFICIT_URL || "",
  },
});
const config = getConfig();

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<IDeficitResponse | void> => {
  const getDeficit = async () => {
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
  try {
    const result = await getDeficit();
    res.json(result);
  } catch (e) {
    if (e?.response?.status === 401) {
      return res.status(401).end();
    }
    logError(e);
    return res.status(500).end();
  }
};

export default handler;
