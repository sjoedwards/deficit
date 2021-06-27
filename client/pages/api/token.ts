import Cookies from "cookies";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getConfig } from "../../tools/get-config";
import { logError } from "../../tools/log-error";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req?.query?.code;
  const cookies = new Cookies(req, res);
  if (!code) {
    logError("No code present");
    return res.status(500).end();
  } else {
    const config = getConfig();

    const getToken = async () => {
      if (!config?.urls?.token) {
        throw new Error(`Can't get token information, no token URI defined`);
      }

      const response = await axios.get(`${config.urls.token}?code=${code}`);
      return response.data;
    };
    try {
      const result = await getToken();

      cookies.set("accessToken", result.accessToken);
      res.redirect("/");
    } catch (e) {
      if (e?.response?.status === 401) {
        return res.status(401).end();
      }
      logError(e);
      return res.status(500).end();
    }
  }
};

export default handler;
