import { Cookies } from "cookies";
import { NextHandler } from "next-connect";
import { NextApiResponse } from "next";
import { IExtendedRequest } from "./../../../types/index";
import btoa from "btoa";
import axios from "axios";
import { Context, Next } from "koa";

const getTokens = async (
  req: IExtendedRequest,
  res: NextApiResponse,
  accessCode: string
) => {
  const redirectUri = encodeURI(
    process.env.REDIRECT_URI || "http://localhost:3000/token"
  );
  if (!accessCode) {
    /* eslint-disable-next-line no-console */
    return ctx.throw(401);
  }
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  const clientId = process.env.FITBIT_CLIENT_ID;
  const authString = btoa(`${clientId}:${clientSecret}`);
  const headers = {
    Authorization: `Basic ${authString}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  try {
    const response = await axios({
      url: `https://api.fitbit.com/oauth2/token?code=${accessCode}&grant_type=authorization_code&client_id=${clientId}&redirect_uri=${redirectUri}`,
      method: "post",
      headers,
    });
    /* eslint-disable-next-line no-console */
    console.log("Successfully obtained token");
    return response && response.data;
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.log("Failed to obtain token");
    /* eslint-disable-next-line no-console */
    console.log(e && e.response && e.response.data);
    throw e;
  }
};

const authzMiddleware = async (
  req: IExtendedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  const cookies = new Cookies();
  if (!req.state.token) {
    const accessCode = req.query.code as string;
    const tokens = await getTokens(req, res, accessCode);
    cookies.set("accessToken", tokens.access_token, {
      maxAge: tokens.expires_in,
    });
    req.state.token = tokens && tokens.access_token;
    cookies.set("refreshToken", tokens.refresh_token);
  }

  return next();
};

export { authzMiddleware };
