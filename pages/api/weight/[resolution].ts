import { isResolution } from "./../../../tools/is-resolution";
import createHTTPError from "http-errors";
import { weightService } from "../../../services/weight";
import type { NextApiResponse } from "next";
import nc from "next-connect";
import { setTokenFromCookieMiddleware } from "../../../middleware/setTokenFromCookie";
import { authzMiddleware } from "../../../middleware/authz";
import { errorMiddleware } from "../../../middleware/error";
import { IExtendedRequest } from "../../../types";

const handler = nc<IExtendedRequest, NextApiResponse>({
  onError: errorMiddleware,
})
  .use(setTokenFromCookieMiddleware)
  .use(authzMiddleware)
  .get(async (req, res) => {
    const resolution = req?.query?.resolution as string;
    if (isResolution(resolution)) {
      const result = await weightService(resolution, req, 1);
      res.json(result);
    } else {
      throw new createHTTPError[400]("Resolution not supported");
    }
  });

export default handler;
