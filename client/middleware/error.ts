import { AxiosError } from "axios";
import { Next, Context } from "koa";
import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { logError } from "../tools/log-error";
import { IExtendedRequest } from "../types";

const errorMiddleware = async (
  err: AxiosError,
  req: IExtendedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  logError(`${err}`);
  res.status(500).end();
};

export { errorMiddleware };
