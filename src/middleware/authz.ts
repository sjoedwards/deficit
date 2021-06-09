import btoa from "btoa";
import axios from "axios";
import { Context, Next } from "koa";

const getTokens = async (ctx: Context, accessCode: string) => {
  const redirectUri = encodeURI(
    process.env.REDIRECT_URI || "http://localhost:3000"
  );
  if (!accessCode) {
    /* eslint-disable-next-line no-console */
    console.log("No access code, redirecting to FitBit authZ");
    ctx.cookies.set("path", ctx.path);
    return ctx.redirect(
      `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.FITBIT_CLIENT_ID}&scope=activity%20nutrition%20weight&redirect_uri=${redirectUri}`
    );
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

const authzMiddleware = async (ctx: Context, next: Next) => {
  if (!ctx.state.token) {
    const accessCode = ctx.request.query.code as string;
    const tokens = await getTokens(ctx, accessCode);
    if (ctx.status === 302) {
      return true;
    }
    ctx.cookies.set("accessToken", tokens.access_token, {
      maxAge: tokens.expires_in,
    });
    ctx.cookies.set("refreshToken", tokens.refresh_token);
    const redirectPath = ctx.cookies.get("path") || "/auth";
    ctx.redirect(redirectPath);
  }
  return next();
};

export { authzMiddleware };
