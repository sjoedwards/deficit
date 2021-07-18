import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { logError } from "../tools/log-error";
import { IExtendedRequest } from "../types";
import httpErrors from "http-errors";

const errorMiddleware = async (
  err: Error,
  req: IExtendedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  logError(err);
  if (httpErrors.isHttpError(err)) {
    return res.status(err.status).end();
  }
  return res.status(500).end();
};

export { errorMiddleware };
