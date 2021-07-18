import { deficitService } from "../../services/deficit";
import type { NextApiResponse } from "next";
import nc from "next-connect";
import { setTokenFromCookieMiddleware } from "../../middleware/setTokenFromCookie";
import { authzMiddleware } from "../../middleware/authz";
import { errorMiddleware } from "../../middleware/error";
import { IExtendedRequest } from "../../types";

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
