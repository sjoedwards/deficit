import nc from "next-connect";
import { IExtendedRequest } from "./../../types/index";
import { NextApiResponse } from "next";
import { errorMiddleware } from "../../middleware/error";
import { setTokenFromCookieMiddleware } from "../../middleware/setTokenFromCookie";
import { authzMiddleware } from "../../middleware/authz";

const handler = nc<IExtendedRequest, NextApiResponse>({
  onError: errorMiddleware,
})
  .use(setTokenFromCookieMiddleware)
  .use(authzMiddleware)
  .get(async (req, res) => {
    res.redirect("/");
  });

export default handler;
