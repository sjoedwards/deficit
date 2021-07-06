import { Next, Context } from "koa";
import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { IExtendedRequest } from "../types";

const errorMiddleware = async (
  err: Error,
  req: IExtendedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  try {
    await next();
  } catch (err) {
    res.status = err.status || 500;
    res.end("An error has occured");
  }
};

export { errorMiddleware };
