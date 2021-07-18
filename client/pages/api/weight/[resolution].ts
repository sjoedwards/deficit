import createHTTPError from "http-errors";
import { ResolutionNames } from "../../../types/index";
import { weightService } from "../../../services/weight";
import { deficitService } from "../../../services/deficit";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
    const isResolution = (
      resolution: string
    ): resolution is ResolutionNames => {
      return (
        resolution === "daily" ||
        resolution === "weekly" ||
        resolution === "monthly"
      );
    };

    const resolution = req?.query?.resolution as string;
    console.log(Object.keys(req));

    if (isResolution(resolution)) {
      const result = await weightService(resolution, req);
      res.json(result);
    } else {
      throw new createHTTPError[400]("Resolution not supported");
    }
  });

export default handler;
