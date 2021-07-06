import btoa from "btoa";
import axios from "axios";
import { NextApiResponse } from "next";
import Cookies from "cookies";
import { NextHandler } from "next-connect";
import { IExtendedRequest } from "../types";

const refreshAccessToken = async (refreshToken: string) => {
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  const clientId = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID;
  const authString = btoa(`${clientId}:${clientSecret}`);
  const headers = {
    Authorization: `Basic ${authString}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  try {
    const response = await axios({
      url: `https://api.fitbit.com/oauth2/token?grant_type=refresh_token&refresh_token=${refreshToken}`,
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

const setTokenFromCookieMiddleware = async (
  req: IExtendedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  const cookies = new Cookies(req, res);

  const accessToken = await cookies.get("accessToken");
  const refreshToken = await cookies.get("refreshToken");
  if (accessToken) {
    /* eslint-disable-next-line no-console */
    console.log("Token obtained from cookie");
    req.state = { ...req.state, token: accessToken };
  } else if (refreshToken) {
    /* eslint-disable-next-line no-console */
    console.log("Refreshing token");
    try {
      const tokens = await refreshAccessToken(refreshToken);
      if (tokens) {
        cookies.set("accessToken", tokens.access_token, {
          maxAge: tokens.expires_in,
        });
      }
      req.state = { ...req.state, token: tokens && tokens.access_token };
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.log("Failed to refresh token");
      /* eslint-disable-next-line no-console */
      console.log(e && e.response && e.response.data);
    }
  }
  return next();
};

export { setTokenFromCookieMiddleware };
