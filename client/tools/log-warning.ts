import { IExtendedRequest } from "./../types/index";
import { Context } from "koa";

const logWarning = (message: string, request: IExtendedRequest) =>
  console.warn(message, JSON.stringify(request.state));

export { logWarning };
